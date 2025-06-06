/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
// modified from vscode-languageclient
import {
  type Disposable,
  type CancellationStrategy,
  type ClientCapabilities,
  type Diagnostic,
  Emitter,
  type Event,
  type GenericNotificationHandler,
  type GenericRequestHandler,
  type InitializeError,
  type InitializeParams,
  type InitializeResult,
  InitializedNotification,
  LogMessageNotification,
  type Message,
  type MessageReader,
  type MessageStrategy,
  MessageType,
  type MessageWriter,
  type NotificationHandler,
  PositionEncodingKind,
  type ProgressType,
  PublishDiagnosticsNotification,
  ResponseError,
  type ServerCapabilities,
  TextDocumentSyncKind,
  type TextDocumentSyncOptions,
  type PublishDiagnosticsParams,
  type ProtocolRequestType0,
  type CancellationToken,
  type ProtocolRequestType,
  type RequestType0,
  type RequestType,
  type MessageSignature,
  ErrorCodes,
  CancellationToken as ProtocolCancellationToken,
  LSPErrorCodes,
  type RequestHandler0,
  type RequestHandler,
  type ProtocolNotificationType0,
  type ProtocolNotificationType,
  type NotificationType0,
  type NotificationType,
  DidOpenTextDocumentNotification,
  type DidOpenTextDocumentParams,
  type NotificationHandler0,
  WorkDoneProgress,
  type ProgressToken,
  type WorkDoneProgressBegin,
  type WorkDoneProgressReport,
  type WorkDoneProgressEnd,
  DidChangeTextDocumentNotification,
  type DidChangeTextDocumentParams,
} from 'vscode-languageserver-protocol/browser';
import { type Connection, createConnection } from './connection';
import { URI } from 'vscode-uri';
import * as Is from './is'
import { Delayer, Semaphore } from './async';
import { DidChangeTextDocumentFeature } from './features/did-change-textdocument-feature';

interface MessageTransports {
  reader: MessageReader;
  writer: MessageWriter;
  detached?: boolean;
}

enum RevealOutputChannelOn {
  Debug = 0,
  Info = 1,
  Warn = 2,
  Error = 3,
  Never = 4,
}

enum ShutdownMode {
  Restart = 'restart',
  Stop = 'stop',
}

enum ClientState {
  Initial = 'initial',
  Starting = 'starting',
  StartFailed = 'startFailed',
  Running = 'running',
  Stopping = 'stopping',
  Stopped = 'stopped',
}

/**
 * A handler that is invoked when the initialization of the server failed.
 */
export type InitializationFailedHandler =
  /**
   * @param error The error returned from the server
   * @returns if true is returned the client tries to reinitialize the server.
   *  Implementors of a handler are responsible to not initialize the server
   *  infinitely. Return false if initialization should stop and an error
   *  should be reported.
   */
  (error: ResponseError<InitializeError> | Error | any) => boolean;

/**
 * An action to be performed when the connection is producing errors.
 */
export enum ErrorAction {
  /**
   * Continue running the server.
   */
  Continue = 1,

  /**
   * Shutdown the server.
   */
  Shutdown = 2,
}

export interface ErrorHandlerResult {
  /**
   * The action to take.
   */
  action: ErrorAction;

  /**
   * An optional message to be presented to the user.
   */
  message?: string;

  /**
   * If set to true the client assumes that the corresponding
   * error handler has presented an appropriate message to the
   * user and the message will only be log to the client's
   * output channel.
   */
  handled?: boolean;
}

/**
 * An action to be performed when the connection to a server got closed.
 */
export enum CloseAction {
  /**
   * Don't restart the server. The connection stays closed.
   */
  DoNotRestart = 1,

  /**
   * Restart the server.
   */
  Restart = 2,
}

export interface CloseHandlerResult {
  /**
   * The action to take.
   */
  action: CloseAction;

  /**
   * An optional message to be presented to the user.
   */
  message?: string;

  /**
   * If set to true the client assumes that the corresponding
   * close handler has presented an appropriate message to the
   * user and the message will only be log to the client's
   * output channel.
   */
  handled?: boolean;
}

/**
 * A plugable error handler that is invoked when the connection is either
 * producing errors or got closed.
 */
export interface ErrorHandler {
  /**
   * An error has occurred while writing or reading from the connection.
   *
   * @param error - the error received
   * @param message - the message to be delivered to the server if know.
   * @param count - a count indicating how often an error is received. Will
   *  be reset if a message got successfully send or received.
   */
  error: (error: Error, message: Message | undefined, count: number | undefined) => ErrorHandlerResult | Promise<ErrorHandlerResult>;

  /**
   * The connection to the server got closed.
   */
  closed: () => CloseHandlerResult | Promise<CloseHandlerResult>;
}

class DefaultErrorHandler implements ErrorHandler {

  private readonly restarts: number[];

  constructor(private client: BaseLanguageClient, private maxRestartCount: number) {
    this.restarts = [];
  }

  public error(_error: Error, _message: Message | undefined, count: number | undefined): ErrorHandlerResult {
    if (count && count <= 3) {
      return { action: ErrorAction.Continue };
    }
    return { action: ErrorAction.Shutdown };
  }

  public closed(): CloseHandlerResult {
    this.restarts.push(Date.now());
    if (this.restarts.length <= this.maxRestartCount) {
      return { action: CloseAction.Restart };
    } else {
      const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
      if (diff <= 3 * 60 * 1000) {
        return { action: CloseAction.DoNotRestart, message: `The ${this.client.name} server crashed ${this.maxRestartCount + 1} times in the last 3 minutes. The server will not be restarted. See the output for more information.` };
      } else {
        this.restarts.shift();
        return { action: CloseAction.Restart };
      }
    }
  }
}

export enum State {
  /**
   * The client is stopped or got never started.
   */
  Stopped = 1,
  /**
   * The client is starting but not ready yet.
   */
  Starting = 3,
  /**
   * The start has failed.
   */
  StartFailed = 4,
  /**
   * The client is running and ready.
   */
  Running = 2,
}

export interface StateChangeEvent {
  oldState: State;
  newState: State;
}

interface OutputChannel {
  dispose: () => void;
  appendLine: (str: string) => void;
  show: (show: boolean) => void;
}

export interface HandleWorkDoneProgressSignature {
  (this: void, token: ProgressToken, params: WorkDoneProgressBegin | WorkDoneProgressReport | WorkDoneProgressEnd): void;
}

interface _Middleware {
  handleWorkDoneProgress?: (this: void, token: ProgressToken, params: WorkDoneProgressBegin | WorkDoneProgressReport | WorkDoneProgressEnd, next: HandleWorkDoneProgressSignature) => void;
}

// A general middleware is applied to both requests and notifications
interface GeneralMiddleware {
  sendRequest?: <P, R>(
    this: void,
    type: string | MessageSignature,
    param: P | undefined,
    token: CancellationToken | undefined,
    next: (type: string | MessageSignature, param?: P, token?: CancellationToken) => Promise<R>,
  ) => Promise<R>;

  sendNotification?: <R>(
    this: void,
    type: string | MessageSignature,
    next: (type: string | MessageSignature, params?: R) => Promise<void>,
    params: R
  ) => Promise<void>;
}

type Middleware = _Middleware & GeneralMiddleware

interface LanguageClientOptions {
  connectionOptions?: {
    cancellationStrategy?: CancellationStrategy;
    messageStrategy?: MessageStrategy;
    maxRestartCount?: number;
  };
  outputChannel?: OutputChannel;
  initializationOptions?: any | (() => any);
  initializationFailedHandler?: InitializationFailedHandler;
  errorHandler?: ErrorHandler;
  middleware?: Middleware;
  // 以下为新增
  clientCapabilities?: ClientCapabilities;
  locale?: string;
}

interface ResolvedClientOptions {
  connectionOptions?: {
    cancellationStrategy?: CancellationStrategy;
    messageStrategy?: MessageStrategy;
    maxRestartCount?: number;
  };
  initializationOptions?: any | (() => any);
  initializationFailedHandler?: InitializationFailedHandler;
  errorHandler: ErrorHandler;
  middleware: Middleware;
  // 以下为新增
  clientCapabilities?: ClientCapabilities;
  locale?: string;
}

interface ResolvedTextDocumentSyncCapabilities {
  resolvedTextDocumentSync?: TextDocumentSyncOptions;
}

abstract class BaseLanguageClient {
  private _id: string;
  private _name: string;
  private _state: ClientState;
  private _connection: Connection | undefined;
  private _onStart: Promise<void> | undefined;
  private _onStop: Promise<void> | undefined;
  private _stateChangeEmitter: Emitter<StateChangeEvent>;
  // @ts-expect-error initialize on start
  private _diagnostics: Map<string, Diagnostic[]>;
  private _capabilities!: ServerCapabilities & ResolvedTextDocumentSyncCapabilities;
  private _clientOptions: ResolvedClientOptions;
  private _disposed: 'disposing' | 'disposed' | undefined;
  private _initializeResult: InitializeResult | undefined;
  private _outputChannel: OutputChannel | undefined;
  private _disposeOutputChannel: boolean;
  private readonly _notificationHandlers: Map<string, GenericNotificationHandler>;
  private readonly _notificationDisposables: Map<string, Disposable>;
  private readonly _pendingNotificationHandlers: Map<string, GenericNotificationHandler>;
  private readonly _requestHandlers: Map<string, GenericRequestHandler<unknown, unknown>>;
  private readonly _requestDisposables: Map<string, Disposable>;
  private readonly _pendingRequestHandlers: Map<string, GenericRequestHandler<unknown, unknown>>;
  private readonly _progressHandlers: Map<string | number, { type: ProgressType<any>; handler: NotificationHandler<any> }>;
  private readonly _progressDisposables: Map<string | number, Disposable>;
  private readonly _pendingProgressHandlers: Map<string | number, { type: ProgressType<any>; handler: NotificationHandler<any> }>;

  private readonly _pendingOpenNotifications: Set<string>;
  private readonly _pendingChangeSemaphore: Semaphore<void>;
  private readonly _pendingChangeDelayer: Delayer<void>;

  private _didChangeTextDocumentFeature: DidChangeTextDocumentFeature | undefined;

  constructor(
    id: string,
    name: string,
    clientOptions: LanguageClientOptions = {},
  ) {
    this._id = id;
    this._name = name;
    this._state = ClientState.Initial;
    this._connection = undefined;
    this._stateChangeEmitter = new Emitter<StateChangeEvent>();
    this._initializeResult = undefined;
    this._clientOptions = {
      connectionOptions: clientOptions.connectionOptions,
      initializationOptions: clientOptions.initializationOptions,
      initializationFailedHandler: clientOptions.initializationFailedHandler,
      errorHandler: clientOptions.errorHandler ?? this.createDefaultErrorHandler(clientOptions.connectionOptions?.maxRestartCount),
      middleware: clientOptions.middleware ?? {},
      clientCapabilities: clientOptions.clientCapabilities,
      locale: clientOptions.locale,
    }
    if (clientOptions.outputChannel) {
      this._outputChannel = clientOptions.outputChannel;
      this._disposeOutputChannel = false;
    } else {
      this._outputChannel = undefined;
      this._disposeOutputChannel = true;
    }

    this._notificationHandlers = new Map();
    this._pendingNotificationHandlers = new Map();
    this._notificationDisposables = new Map();
    this._requestHandlers = new Map();
    this._pendingRequestHandlers = new Map();
    this._requestDisposables = new Map();
    this._progressHandlers = new Map();
    this._pendingProgressHandlers = new Map();
    this._progressDisposables = new Map();

    this._pendingOpenNotifications = new Set();
    this._pendingChangeSemaphore = new Semaphore(1);
    this._pendingChangeDelayer = new Delayer<void>(250);
  }

  public name(): string {
    return this._name
  }

  public get outputChannel(): OutputChannel {
    if (!this._outputChannel) {
      this._outputChannel = {
        show() {},
        appendLine() {},
        dispose() {},
      };
    }
    return this._outputChannel;
  }

  private get $state(): ClientState {
    return this._state;
  }

  private set $state(value: ClientState) {
    const oldState = this.getPublicState();
    this._state = value;
    const newState = this.getPublicState();
    if (newState !== oldState) {
      this._stateChangeEmitter.fire({ oldState, newState });
    }
  }

  private getPublicState(): State {
    switch (this.$state) {
      case ClientState.Starting:
        return State.Starting;
      case ClientState.Running:
        return State.Running;
      case ClientState.StartFailed:
        return State.StartFailed;
      default:
        return State.Stopped;
    }
  }

  public get onDidChangeState(): Event<StateChangeEvent> {
    return this._stateChangeEmitter.event;
  }

  public needsStart(): boolean {
    return this.$state === ClientState.Initial || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped;
  }

  public needsStop(): boolean {
    return this.$state === ClientState.Starting || this.$state === ClientState.Running;
  }

  private activeConnection(): Connection | undefined {
    return this.$state === ClientState.Running && this._connection !== undefined ? this._connection : undefined;
  }

  public isRunning(): boolean {
    return this.$state === ClientState.Running;
  }

  public createDefaultErrorHandler(maxRestartCount?: number): ErrorHandler {
    if (maxRestartCount !== undefined && maxRestartCount < 0) {
      throw new Error(`Invalid maxRestartCount: ${maxRestartCount}`);
    }
    return new DefaultErrorHandler(this, maxRestartCount ?? 4);
  }

  public sendRequest<R, PR, E, RO>(type: ProtocolRequestType0<R, PR, E, RO>, token?: CancellationToken): Promise<R>;
  public sendRequest<P, R, PR, E, RO>(type: ProtocolRequestType<P, R, PR, E, RO>, params: P, token?: CancellationToken): Promise<R>;
  public sendRequest<R, E>(type: RequestType0<R, E>, token?: CancellationToken): Promise<R>;
  public sendRequest<P, R, E>(type: RequestType<P, R, E>, params: P, token?: CancellationToken): Promise<R>;
  public sendRequest<R>(method: string, token?: CancellationToken): Promise<R>;
  public sendRequest<R>(method: string, param: any, token?: CancellationToken): Promise<R>;
  public async sendRequest<R>(type: string | MessageSignature, ...params: any[]): Promise<R> {
    if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
      return Promise.reject(new ResponseError(ErrorCodes.ConnectionInactive, 'Client is not running'));
    }

    // Ensure we have a connection before we force the document sync.
    const connection = await this.$start();

    await this.sendPendingFullTextDocumentChanges(connection);

    // If any document is synced in full mode make sure we flush any pending
    // full document syncs.
    if (this._didChangeTextDocumentFeature!.syncKind === TextDocumentSyncKind.Full) {
      await this.sendPendingFullTextDocumentChanges(connection);
    }

    let param: any | undefined = undefined;
    let token: CancellationToken | undefined = undefined;
    // Separate cancellation tokens from other parameters for a better client interface
    if (params.length === 1) {
      // CancellationToken is an interface, so we need to check if the first param complies to it
      if (ProtocolCancellationToken.is(params[0])) {
        token = params[0];
      } else {
        param = params[0];
      }
    } else if (params.length === 2) {
      param = params[0];
      token = params[1];
    }
    if (token !== undefined && token.isCancellationRequested) {
      return Promise.reject(new ResponseError(LSPErrorCodes.RequestCancelled, 'Request got cancelled'));
    }
    const _sendRequest = this._clientOptions.middleware?.sendRequest;
    if (_sendRequest !== undefined) {
      // Return the general middleware invocation defining `next` as a utility function that reorganizes parameters to
      // pass them to the original sendRequest function.
      return _sendRequest(type, param, token, (type, param, token) => {
        const params: any[] = [];

        // Add the parameters if there are any
        if (param !== undefined) {
          params.push(param);
        }

        // Add the cancellation token if there is one
        if (token !== undefined) {
          params.push(token);
        }

        return connection.sendRequest<R>(type, ...params);
      });
    } else {
      return connection.sendRequest<R>(type, ...params);
    }
  }

  public onRequest<R, PR, E, RO>(type: ProtocolRequestType0<R, PR, E, RO>, handler: RequestHandler0<R, E>): Disposable;
  public onRequest<P, R, PR, E, RO>(type: ProtocolRequestType<P, R, PR, E, RO>, handler: RequestHandler<P, R, E>): Disposable;
  public onRequest<R, E>(type: RequestType0<R, E>, handler: RequestHandler0<R, E>): Disposable;
  public onRequest<P, R, E>(type: RequestType<P, R, E>, handler: RequestHandler<P, R, E>): Disposable;
  public onRequest<R, E>(method: string, handler: GenericRequestHandler<R, E>): Disposable;
  public onRequest<R, E>(type: string | MessageSignature, handler: GenericRequestHandler<R, E>): Disposable {
    const method = typeof type === 'string' ? type : type.method;
    this._requestHandlers.set(method, handler);
    const connection = this.activeConnection();
    let disposable: Disposable;
    if (connection !== undefined) {
      this._requestDisposables.set(method, connection.onRequest(type, handler));
      disposable = {
        dispose: () => {
          const disposable = this._requestDisposables.get(method);
          if (disposable !== undefined) {
            disposable.dispose();
            this._requestDisposables.delete(method);
          }
        },
      };
    } else {
      this._pendingRequestHandlers.set(method, handler);
      disposable = {
        dispose: () => {
          this._pendingRequestHandlers.delete(method);
          const disposable = this._requestDisposables.get(method);
          if (disposable !== undefined) {
            disposable.dispose();
            this._requestDisposables.delete(method);
          }
        },
      };
    }
    return {
      dispose: () => {
        this._requestHandlers.delete(method);
        disposable.dispose();
      },
    };
  }

  public sendNotification<RO>(type: ProtocolNotificationType0<RO>): Promise<void>;
  public sendNotification<P, RO>(type: ProtocolNotificationType<P, RO>, params?: P): Promise<void>;
  public sendNotification(type: NotificationType0): Promise<void>;
  public sendNotification<P>(type: NotificationType<P>, params?: P): Promise<void>;
  public sendNotification(method: string): Promise<void>;
  public sendNotification(method: string, params: any): Promise<void>;
  public async sendNotification<P>(type: string | MessageSignature, params?: P): Promise<void> {
    if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
      return Promise.reject(new ResponseError(ErrorCodes.ConnectionInactive, 'Client is not running'));
    }

    const needsPendingFullTextDocumentSync = true;
    let openNotification: string | undefined;
    if (needsPendingFullTextDocumentSync && typeof type !== 'string' && type.method === DidOpenTextDocumentNotification.method) {
      openNotification = (params as DidOpenTextDocumentParams)?.textDocument.uri;
      this._pendingOpenNotifications.add(openNotification);
    }

    // Ensure we have a connection before we force the document sync.
    const connection = await this.$start();

    // If any document is synced in full mode make sure we flush any pending
    // full document syncs.
    if (needsPendingFullTextDocumentSync) {
      await this.sendPendingFullTextDocumentChanges(connection);
    }

    // We need to remove the pending open notification before we actually
    // send the notification over the connection. Otherwise there could be
    // a request coming in that although the open notification got already put
    // onto the wire will ignore pending document changes.
    //
    // Since the code path of connection.sendNotification is actually sync
    // until the message is handed of to the writer and the writer as a semaphore
    // lock with a capacity of 1 no additional async scheduling can happen until
    // the message is actually handed of.
    if (openNotification !== undefined) {
      this._pendingOpenNotifications.delete(openNotification);
    }

    const _sendNotification = this._clientOptions.middleware?.sendNotification;

    return _sendNotification
      ? _sendNotification(type, connection.sendNotification.bind(connection), params)
      : connection.sendNotification(type, params);
  }

  public onNotification<RO>(type: ProtocolNotificationType0<RO>, handler: NotificationHandler0): Disposable;
  public onNotification<P, RO>(type: ProtocolNotificationType<P, RO>, handler: NotificationHandler<P>): Disposable;
  public onNotification(type: NotificationType0, handler: NotificationHandler0): Disposable;
  public onNotification<P>(type: NotificationType<P>, handler: NotificationHandler<P>): Disposable;
  public onNotification(method: string, handler: GenericNotificationHandler): Disposable;
  public onNotification(type: string | MessageSignature, handler: GenericNotificationHandler): Disposable {
    const method = typeof type === 'string' ? type : type.method;
    this._notificationHandlers.set(method, handler);
    const connection = this.activeConnection();
    let disposable: Disposable;
    if (connection !== undefined) {
      this._notificationDisposables.set(method, connection.onNotification(type, handler));
      disposable = {
        dispose: () => {
          const disposable = this._notificationDisposables.get(method);
          if (disposable !== undefined) {
            disposable.dispose();
            this._notificationDisposables.delete(method);
          }
        },
      };
    } else {
      this._pendingNotificationHandlers.set(method, handler);
      disposable = {
        dispose: () => {
          this._pendingNotificationHandlers.delete(method);
          const disposable = this._notificationDisposables.get(method);
          if (disposable !== undefined) {
            disposable.dispose();
            this._notificationDisposables.delete(method);
          }
        },
      };
    }
    return {
      dispose: () => {
        this._notificationHandlers.delete(method);
        disposable.dispose();
      },
    };
  }

  public async sendProgress<P>(type: ProgressType<P>, token: string | number, value: P): Promise<void> {
    if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
      return Promise.reject(new ResponseError(ErrorCodes.ConnectionInactive, 'Client is not running'));
    }
    try {
      // Ensure we have a connection before we force the document sync.
      const connection = await this.$start();
      return connection.sendProgress(type, token, value);
    } catch (error) {
      this.error(`Sending progress for token ${token} failed.`, error);
      throw error;
    }
  }

  public onProgress<P>(type: ProgressType<P>, token: string | number, handler: NotificationHandler<P>): Disposable {
    this._progressHandlers.set(token, { type, handler });
    const connection = this.activeConnection();
    let disposable: Disposable;
    const handleWorkDoneProgress = this._clientOptions.middleware?.handleWorkDoneProgress;
    const realHandler = WorkDoneProgress.is(type) && handleWorkDoneProgress !== undefined
      ? (params: P) => {
        handleWorkDoneProgress(token, params as any, () => handler(params as unknown as P));
      }
      : handler;
    if (connection !== undefined) {
      this._progressDisposables.set(token, connection.onProgress(type, token, realHandler));
      disposable = {
        dispose: () => {
          const disposable = this._progressDisposables.get(token);
          if (disposable !== undefined) {
            disposable.dispose();
            this._progressDisposables.delete(token);
          }
        },
      };
    } else {
      this._pendingProgressHandlers.set(token, { type, handler });
      disposable = {
        dispose: () => {
          this._pendingProgressHandlers.delete(token);
          const disposable = this._progressDisposables.get(token);
          if (disposable !== undefined) {
            disposable.dispose();
            this._progressDisposables.delete(token);
          }
        },
      };
    }
    return {
      dispose: (): void => {
        this._progressHandlers.delete(token);
        disposable.dispose();
      },
    };
  }

  public async didChangeTextDocument(event: DidChangeTextDocumentParams) {
    await this._didChangeTextDocumentFeature!.callback(event)
  }

  private async sendPendingFullTextDocumentChanges(connection: Connection): Promise<void> {
    return this._pendingChangeSemaphore.lock(async () => {
      try {
        const changes = this._didChangeTextDocumentFeature!.getPendingDocumentChanges(this._pendingOpenNotifications);
        if (changes.length === 0) {
          return;
        }
        for (const params of changes) {
          // We await the send and not the delivery since it is more or less the same for
          // notifications.
          await connection.sendNotification(DidChangeTextDocumentNotification.type, params);
        }
      } catch (error) {
        this.error('Sending pending changes failed', error, false);
        throw error;
      }
    });
  }

  private triggerPendingChangeDelivery(): void {
    this._pendingChangeDelayer.trigger(async () => {
      const connection = this.activeConnection();
      if (connection === undefined) {
        this.triggerPendingChangeDelivery();
        return;
      }
      await this.sendPendingFullTextDocumentChanges(connection);

    }).catch((error) => this.error('Delivering pending changes failed', error, false));
  }

  protected registerBuiltinFeatures() {
    this._didChangeTextDocumentFeature = new DidChangeTextDocumentFeature(this);
    this._didChangeTextDocumentFeature.onPendingChangeAdded(() => {
      this.triggerPendingChangeDelivery();
    });
  }

  private async $start(): Promise<Connection> {
    if (this.$state === ClientState.StartFailed) {
      throw new Error(`Previous start failed. Can't restart server.`);
    }
    await this.start();
    const connection = this.activeConnection();
    if (connection === undefined) {
      throw new Error('Starting server failed');
    }
    return connection;
  }

  public async start(): Promise<void> {
    if (this._disposed === 'disposing' || this._disposed === 'disposed') {
      throw new Error(`Client got disposed and can't be restarted.`);
    }
    if (this.$state === ClientState.Stopping) {
      throw new Error('Client is currently stopping. Can only restart a full stopped client');
    }
    // We are already running or are in the process of getting up
    // to speed.
    if (this._onStart !== undefined) {
      return this._onStart;
    }
    const [promise, resolve, reject] = this.createOnStartPromise();
    this._onStart = promise;

    // If we restart then the diagnostics collection is reused.
    if (this._diagnostics === undefined) {
      this._diagnostics = new Map();
    }

    // When we start make all buffer handlers pending so that they
    // get added.
    for (const [method, handler] of this._notificationHandlers) {
      if (!this._pendingNotificationHandlers.has(method)) {
        this._pendingNotificationHandlers.set(method, handler);
      }
    }
    for (const [method, handler] of this._requestHandlers) {
      if (!this._pendingRequestHandlers.has(method)) {
        this._pendingRequestHandlers.set(method, handler);
      }
    }
    for (const [token, data] of this._progressHandlers) {
      if (!this._pendingProgressHandlers.has(token)) {
        this._pendingProgressHandlers.set(token, data);
      }
    }

    this.$state = ClientState.Starting;
    try {
      const connection = await this.createConnection();
      connection.onNotification(LogMessageNotification.type, (message) => {
        switch (message.type) {
          case MessageType.Error:
            this.error(message.message, undefined, false);
            break;
          case MessageType.Warning:
            this.warn(message.message, undefined, false);
            break;
          case MessageType.Info:
            this.info(message.message, undefined, false);
            break;
          case MessageType.Debug:
            this.debug(message.message, undefined, false);
            break;
          default:
            this.outputChannel?.appendLine(message.message);
        }
      });

      connection.listen();
      await this.initialize(connection);
      resolve();
    } catch (error) {
      this.$state = ClientState.StartFailed;
      this.error(`${this._name} client: couldn't create connection to server.`, error, 'force');
      reject(error);
    }

    return this._onStart;
  }

  private createOnStartPromise(): [Promise<void>, () => void, (error: any) => void] {
    let resolve!: () => void;
    let reject!: (error: any) => void;
    const promise: Promise<void> = new Promise((_resolve, _reject) => {
      resolve = _resolve;
      reject = _reject;
    });
    return [promise, resolve, reject];
  }

  private async initialize(connection: Connection): Promise<InitializeResult> {
    const { clientCapabilities, initializationOptions, locale } = this._clientOptions;
    const rootPath = '/'

    // If the client is locked to a workspace folder use it. In this case the workspace folder
    // feature is not registered and we need to initialize the value here.
    const initParams: InitializeParams = {
      processId: null,
      locale,
      rootPath,
      rootUri: URI.file(rootPath).toString(),
      capabilities: clientCapabilities ?? {},
      initializationOptions: Is.func(initializationOptions) ? initializationOptions() : initializationOptions,
      trace: 'off',
      workspaceFolders: [
        { uri: URI.file(rootPath).toString(), name: 'root' },
      ],
    };

    return this.doInitialize(connection, initParams);
  }

  private async doInitialize(connection: Connection, initParams: InitializeParams): Promise<InitializeResult> {
    try {
      const result = await connection.initialize(initParams);
      if (result.capabilities.positionEncoding !== undefined && result.capabilities.positionEncoding !== PositionEncodingKind.UTF16) {
        throw new Error(`Unsupported position encoding (${result.capabilities.positionEncoding}) received from server ${this.name}`);
      }

      this._initializeResult = result;
      this.$state = ClientState.Running;

      let textDocumentSyncOptions: TextDocumentSyncOptions | undefined = undefined;
      if (Is.number(result.capabilities.textDocumentSync)) {
        if (result.capabilities.textDocumentSync === TextDocumentSyncKind.None) {
          textDocumentSyncOptions = {
            openClose: false,
            change: TextDocumentSyncKind.None,
            save: undefined,
          };
        } else {
          textDocumentSyncOptions = {
            openClose: true,
            change: result.capabilities.textDocumentSync,
            save: {
              includeText: false,
            },
          };
        }
      } else if (result.capabilities.textDocumentSync !== undefined && result.capabilities.textDocumentSync !== null) {
        textDocumentSyncOptions = result.capabilities.textDocumentSync as TextDocumentSyncOptions;
      }
      this._capabilities = Object.assign({}, result.capabilities, { resolvedTextDocumentSync: textDocumentSyncOptions });

      connection.onNotification(PublishDiagnosticsNotification.type, params => this.handleDiagnostics(params));

      // Add pending notification, request and progress handlers.
      for (const [method, handler] of this._pendingNotificationHandlers) {
        this._notificationDisposables.set(method, connection.onNotification(method, handler));
      }
      this._pendingNotificationHandlers.clear();
      for (const [method, handler] of this._pendingRequestHandlers) {
        this._requestDisposables.set(method, connection.onRequest(method, handler));
      }
      this._pendingRequestHandlers.clear();
      for (const [token, data] of this._pendingProgressHandlers) {
        this._progressDisposables.set(token, connection.onProgress(data.type, token, data.handler));
      }
      this._pendingProgressHandlers.clear();

      await connection.sendNotification(InitializedNotification.type, {});

      // this.hookFileEvents(connection);
      // this.hookConfigurationChanged(connection);
      // this.initializeFeatures(connection);

      // 新增逻辑
      this.registerBuiltinFeatures()

      return result;
    } catch (error: any) {
      if (this._clientOptions.initializationFailedHandler) {
        if (this._clientOptions.initializationFailedHandler(error)) {
          void this.initialize(connection);
        } else {
          void this.stop();
        }
      } else if (error instanceof ResponseError && error.data && error.data.retry) {
        // void Window.showErrorMessage(error.message, { title: 'Retry', id: 'retry' }).then(item => {
        //   if (item && item.id === 'retry') {
        //     void this.initialize(connection);
        //   } else {
        //     void this.stop();
        //   }
        // });
        this.stop();
      } else {
        // if (error && error.message) {
        //   void Window.showErrorMessage(error.message);
        // }
        this.error('Server initialization failed.', error);
        void this.stop();
      }
      throw error;
    }
  }

  private handleDiagnostics(params: PublishDiagnosticsParams) {
    if (!this._diagnostics) {
      return;
    }

    this._diagnostics.set(params.uri, params.diagnostics);
  }

  public get diagnostics() {
    return this._diagnostics;
  }

  private async createConnection(): Promise<Connection> {
    const errorHandler = (error: Error, message: Message | undefined, count: number | undefined) => {
      this.handleConnectionError(error, message, count).catch((error) => this.error('Handling connection error failed', error));
    };

    const closeHandler = () => {
      this.handleConnectionClosed().catch((error) => this.error('Handling connection close failed', error));
    };

    const transports = await this.createMessageTransports('utf8');
    this._connection = createConnection(transports.reader, transports.writer, errorHandler, closeHandler, this._clientOptions.connectionOptions);
    return this._connection;
  }

  protected async handleConnectionClosed(): Promise<void> {
    // Check whether this is a normal shutdown in progress or the client stopped normally.
    if (this.$state === ClientState.Stopped) {
      return;
    }
    try {
      if (this._connection !== undefined) {
        this._connection.dispose();
      }
    } catch (error) {
      // Disposing a connection could fail if error cases.
    }
    let handlerResult: CloseHandlerResult = { action: CloseAction.DoNotRestart };
    if (this.$state !== ClientState.Stopping) {
      try {
        handlerResult = await this._clientOptions.errorHandler!.closed();
      } catch (error) {
        // Ignore errors coming from the error handler.
      }
    }
    this._connection = undefined;
    if (handlerResult.action === CloseAction.DoNotRestart) {
      this.error(handlerResult.message ?? 'Connection to server got closed. Server will not be restarted.', undefined, handlerResult.handled === true ? false : 'force');
      this.cleanUp(ShutdownMode.Stop);
      if (this.$state === ClientState.Starting) {
        this.$state = ClientState.StartFailed;
      } else {
        this.$state = ClientState.Stopped;
      }
      this._onStop = Promise.resolve();
      this._onStart = undefined;
    } else if (handlerResult.action === CloseAction.Restart) {
      this.info(handlerResult.message ?? 'Connection to server got closed. Server will restart.', undefined, !handlerResult.handled);
      this.cleanUp(ShutdownMode.Restart);
      this.$state = ClientState.Initial;
      this._onStop = Promise.resolve();
      this._onStart = undefined;
      this.start().catch((error) => this.error('Restarting server failed', error, 'force'));
    }
  }

  private async handleConnectionError(error: Error, message: Message | undefined, count: number | undefined): Promise<void> {
    const handlerResult: ErrorHandlerResult = await this._clientOptions.errorHandler!.error(error, message, count);
    if (handlerResult.action === ErrorAction.Shutdown) {
      this.error(handlerResult.message ?? `Client ${this._name}: connection to server is erroring.\n${error.message}\nShutting down server.`, undefined, handlerResult.handled === true ? false : 'force');
      this.stop().catch((error) => {
        this.error('Stopping server failed', error, false);
      });
    } else {
      this.error(handlerResult.message ??
        `Client ${this._name}: connection to server is erroring.\n${error.message}`, undefined, handlerResult.handled === true ? false : 'force');
    }
  }

  abstract createMessageTransports(encoding: string): Promise<MessageTransports>

  public debug(message: string, data?: any, showNotification = true): void {
    this.logOutputMessage(MessageType.Debug, RevealOutputChannelOn.Debug, 'Debug', message, data, showNotification);
  }

  public info(message: string, data?: any, showNotification = true): void {
    this.logOutputMessage(MessageType.Info, RevealOutputChannelOn.Info, 'Info', message, data, showNotification);
  }

  public warn(message: string, data?: any, showNotification = true): void {
    this.logOutputMessage(MessageType.Warning, RevealOutputChannelOn.Warn, 'Warn', message, data, showNotification);
  }

  public error(message: string, data?: any, showNotification: boolean | 'force' = true): void {
    this.logOutputMessage(MessageType.Error, RevealOutputChannelOn.Error, 'Error', message, data, showNotification);
  }

  private logOutputMessage(type: MessageType, reveal: RevealOutputChannelOn, name: string, message: string, data: any | undefined, showNotification: boolean | 'force'): void {
    this.outputChannel.appendLine(`[${name.padEnd(5)} - ${(new Date().toLocaleTimeString())}] ${message}`);
    if (data !== null && data !== undefined) {
      this.outputChannel.appendLine(this.data2String(data));
    }
  }

  private data2String(data: object): string {
    if (data instanceof ResponseError) {
      const responseError = data as ResponseError<any>;
      return `  Message: ${responseError.message}\n  Code: ${responseError.code} ${responseError.data ? '\n' + responseError.data.toString() : ''}`;
    }
    if (data instanceof Error) {
      if (Is.string(data.stack)) {
        return data.stack;
      }
      return (data as Error).message;
    }
    if (Is.string(data)) {
      return data;
    }
    return data.toString();
  }

  public stop(timeout = 2000): Promise<void> {
    // Wait 2 seconds on stop
    return this.shutdown(ShutdownMode.Stop, timeout);
  }

  public dispose(timeout = 2000): Promise<void> {
    try {
      this._disposed = 'disposing';
      return this.stop(timeout);
    } finally {
      this._disposed = 'disposed';
    }
  }

  protected async shutdown(mode: ShutdownMode, timeout = 2000): Promise<void> {
    // If the client is stopped or in its initial state return.
    if (this.$state === ClientState.Stopped || this.$state === ClientState.Initial) {
      return;
    }

    // If we are stopping the client and have a stop promise return it.
    if (this.$state === ClientState.Stopping) {
      if (this._onStop !== undefined) {
        return this._onStop;
      } else {
        throw new Error('Client is stopping but no stop promise available.');
      }
    }

    const connection = this.activeConnection();

    // We can't stop a client that is not running (e.g. has no connection). Especially not
    // on that us starting since it can't be correctly synchronized.
    if (connection === undefined || this.$state !== ClientState.Running) {
      throw new Error(`Client is not running and can't be stopped. It's current state is: ${this.$state}`);
    }

    this._initializeResult = undefined;
    this.$state = ClientState.Stopping;
    this.cleanUp(mode);

    const tp = new Promise<undefined>(c => { globalThis.setTimeout(c, timeout); });
    const shutdown = (async (connection) => {
      await connection.shutdown();
      await connection.exit();
      return connection;
    })(connection);

    return this._onStop = Promise.race([tp, shutdown]).then((connection) => {
      // The connection won the race with the timeout.
      if (connection !== undefined) {
        connection.end();
        connection.dispose();
      } else {
        this.error('Stopping server timed out', undefined, false);
        throw new Error('Stopping the server timed out');
      }
    }, (error) => {
      this.error('Stopping server failed', error, false);
      throw error;
    }).finally(() => {
      this.$state = ClientState.Stopped;
      mode === ShutdownMode.Stop && this.cleanUpChannel();
      this._onStart = undefined;
      this._onStop = undefined;
      this._connection = undefined;
    });
  }

  private cleanUpChannel(): void {
    if (this._outputChannel !== undefined && this._disposeOutputChannel) {
      this._outputChannel.dispose();
      this._outputChannel = undefined;
    }
  }

  private cleanUp(mode: ShutdownMode): void {
    if ((mode === ShutdownMode.Stop || mode === ShutdownMode.Restart) && this._diagnostics !== undefined) {
      this._diagnostics.clear();
      // @ts-expect-error unref
      this._diagnostics = undefined;
    }
  }
}

export {
  BaseLanguageClient,
}

export type {
  MessageTransports,
  LanguageClientOptions,
}
