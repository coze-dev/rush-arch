//  Copyright (c) 2025 coze-dev
//  SPDX-License-Identifier: MIT

import {
	type CancellationToken,
	type ConnectionOptions,
	type Disposable,
	ExitNotification,
	type GenericNotificationHandler,
	type GenericRequestHandler,
	type InitializeParams,
	InitializeRequest,
	type InitializeResult,
	type Logger,
	type Message,
	type MessageReader,
	type MessageSignature,
	type MessageWriter,
	type NotificationHandler,
	type NotificationHandler0,
	type NotificationType,
	type NotificationType0,
	type ProgressType,
	type ProtocolNotificationType,
	type ProtocolNotificationType0,
	type ProtocolRequestType,
	type ProtocolRequestType0,
	type RequestHandler,
	type RequestHandler0,
	type RequestType,
	type RequestType0,
	ShutdownRequest,
	type Trace,
	TraceFormat,
	type TraceOptions,
	type Tracer,
	createProtocolConnection,
} from 'vscode-languageserver-protocol/browser';
import * as Is from './is'

interface Connection {

	listen: () => void;

	sendRequest: (<R, PR, E, RO>(type: ProtocolRequestType0<R, PR, E, RO>, token?: CancellationToken) => Promise<R>) & (<P, R, PR, E, RO>(type: ProtocolRequestType<P, R, PR, E, RO>, params: P, token?: CancellationToken) => Promise<R>) & (<R, E>(type: RequestType0<R, E>, token?: CancellationToken) => Promise<R>) & (<P, R, E>(type: RequestType<P, R, E>, params: P, token?: CancellationToken) => Promise<R>) & (<R>(type: string | MessageSignature, ...params: any[]) => Promise<R>);

	onRequest: (<R, PR, E, RO>(type: ProtocolRequestType0<R, PR, E, RO>, handler: RequestHandler0<R, E>) => Disposable) & (<P, R, PR, E, RO>(type: ProtocolRequestType<P, R, PR, E, RO>, handler: RequestHandler<P, R, E>) => Disposable) & (<R, E>(type: RequestType0<R, E>, handler: RequestHandler0<R, E>) => Disposable) & (<P, R, E>(type: RequestType<P, R, E>, handler: RequestHandler<P, R, E>) => Disposable) & (<R, E>(method: string | MessageSignature, handler: GenericRequestHandler<R, E>) => Disposable);

	hasPendingResponse: () => boolean;

	sendNotification: (<RO>(type: ProtocolNotificationType0<RO>) => Promise<void>) & (<P, RO>(type: ProtocolNotificationType<P, RO>, params?: P) => Promise<void>) & ((type: NotificationType0) => Promise<void>) & (<P>(type: NotificationType<P>, params?: P) => Promise<void>) & ((method: string | MessageSignature, params?: any) => Promise<void>);

	onNotification: (<RO>(type: ProtocolNotificationType0<RO>, handler: NotificationHandler0) => Disposable) & (<P, RO>(type: ProtocolNotificationType<P, RO>, handler: NotificationHandler<P>) => Disposable) & ((type: NotificationType0, handler: NotificationHandler0) => Disposable) & (<P>(type: NotificationType<P>, handler: NotificationHandler<P>) => Disposable) & ((method: string | MessageSignature, handler: GenericNotificationHandler) => Disposable);

	onProgress: <P>(type: ProgressType<P>, token: string | number, handler: NotificationHandler<P>) => Disposable;
	sendProgress: <P>(type: ProgressType<P>, token: string | number, value: P) => Promise<void>;

	trace: ((value: Trace, tracer: Tracer, sendNotification?: boolean) => Promise<void>) & ((value: Trace, tracer: Tracer, traceOptions?: TraceOptions) => Promise<void>);

	initialize: (params: InitializeParams) => Promise<InitializeResult>;
	shutdown: () => Promise<void>;
	exit: () => Promise<void>;

	end: () => void;
	dispose: () => void;
}

class ConsoleLogger implements Logger {
	public error(message: string): void {
		globalThis.console.error(message);
	}
	public warn(message: string): void {
		globalThis.console.warn(message);
	}
	public info(message: string): void {
		globalThis.console.info(message);
	}
	public log(message: string): void {
		globalThis.console.log(message);
	}
}

interface ConnectionErrorHandler {
	(error: Error, message: Message | undefined, count: number | undefined): void;
}

interface ConnectionCloseHandler {
	(): void;
}

function createConnection(input: MessageReader, output: MessageWriter, errorHandler: ConnectionErrorHandler, closeHandler: ConnectionCloseHandler, options?: ConnectionOptions): Connection {
	const logger = new ConsoleLogger();
	const connection = createProtocolConnection(input, output, logger, options);
	connection.onError((data) => { errorHandler(data[0], data[1], data[2]); });
	connection.onClose(closeHandler);
	const result: Connection = {
		listen: (): void => connection.listen(),

		sendRequest: connection.sendRequest,

		onRequest: connection.onRequest,

		hasPendingResponse: connection.hasPendingResponse,

		sendNotification: connection.sendNotification,

		onNotification: connection.onNotification,

		onProgress: connection.onProgress,
		sendProgress: connection.sendProgress,

		trace: (value: Trace, tracer: Tracer, sendNotificationOrTraceOptions?: boolean | TraceOptions): Promise<void> => {
			const defaultTraceOptions: TraceOptions = {
				sendNotification: false,
				traceFormat: TraceFormat.Text,
			};

			if (sendNotificationOrTraceOptions === undefined) {
				return connection.trace(value, tracer, defaultTraceOptions);
			} else if (Is.boolean(sendNotificationOrTraceOptions)) {
				return connection.trace(value, tracer, sendNotificationOrTraceOptions);
			} else {
				return connection.trace(value, tracer, sendNotificationOrTraceOptions);
			}
		},

		initialize: (params: InitializeParams) => 
			// This needs to return and MUST not be await to avoid any async
			// scheduling. Otherwise messages might overtake each other.
			 connection.sendRequest(InitializeRequest.type, params)
		,
		shutdown: () => 
			// This needs to return and MUST not be await to avoid any async
			// scheduling. Otherwise messages might overtake each other.
			 connection.sendRequest(ShutdownRequest.type, undefined)
		,
		exit: () => 
			// This needs to return and MUST not be await to avoid any async
			// scheduling. Otherwise messages might overtake each other.
			 connection.sendNotification(ExitNotification.type)
		,

		end: () => connection.end(),
		dispose: () => connection.dispose(),
	};

	return result;
}

export {
  createConnection,
}

export type {
  Connection,
}
