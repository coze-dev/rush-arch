/* eslint-disable @typescript-eslint/no-unused-vars */
import { Emitter, type Event, DidChangeTextDocumentNotification, type DidChangeTextDocumentParams, VersionedTextDocumentIdentifier, TextDocumentSyncKind } from 'vscode-languageserver-protocol/browser';

interface FeatureClient<M, CO = object> {
  info: (message: string, data?: any, showNotification?: boolean) => void;
  warn: (message: string, data?: any, showNotification?: boolean) => void;
  error: (message: string, data?: any, showNotification?: boolean | 'force') => void;
}

class DidChangeTextDocumentFeature {
  public readonly syncKind: TextDocumentSyncKind = TextDocumentSyncKind.Full;
  private readonly _onPendingChangeAdded: Emitter<void>;
  private readonly _pendingTextDocumentChanges: Map<string, DidChangeTextDocumentParams>;
  private readonly _client: FeatureClient<any>;

  constructor(client: FeatureClient<any>) {
    this._onPendingChangeAdded = new Emitter()
    this._pendingTextDocumentChanges = new Map();
    this._client = client;
  }

  public get onPendingChangeAdded(): Event<void> {
    return this._onPendingChangeAdded.event;
  }

  public async callback(event: DidChangeTextDocumentParams) {
    if (event.contentChanges.length === 0) {
      return;
    }

    const didChange = async (event: DidChangeTextDocumentParams): Promise<void> => {
      const eventUri: string = event.textDocument.uri.toString();
      this._pendingTextDocumentChanges.set(eventUri, event);
      this._onPendingChangeAdded.fire();
    };

    return didChange(event).then(undefined, (error) => {
      this._client.error(`Sending document notification ${DidChangeTextDocumentNotification.type.method} failed`, error);
      throw error;
    });
  }

  public getPendingDocumentChanges(excludes: Set<string>): DidChangeTextDocumentParams[] {
    if (this._pendingTextDocumentChanges.size === 0) {
      return [];
    }
    let result: DidChangeTextDocumentParams[];
    if (excludes.size === 0) {
      result = Array.from(this._pendingTextDocumentChanges.values());
      this._pendingTextDocumentChanges.clear();
    } else {
      result = [];
      for (const entry of this._pendingTextDocumentChanges) {
        if (!excludes.has(entry[0])) {
          result.push(entry[1]);
          this._pendingTextDocumentChanges.delete(entry[0]);
        }
      }
    }
    return result;
  }

  public dispose() {
    this._pendingTextDocumentChanges.clear();
  }
}

export {
  DidChangeTextDocumentFeature,
}