import { BrowserMessageReader, BrowserMessageWriter } from 'vscode-languageserver-protocol/browser';
import { type IWebSocket, WebSocketMessageReader, WebSocketMessageWriter } from 'vscode-ws-jsonrpc/socket';
import { BaseLanguageClient, type LanguageClientOptions, type MessageTransports } from './base-client';

type Channel = MessagePort | Worker | WebSocket

class LanguageClient extends BaseLanguageClient {
  private _createChannel: () => Channel;

  constructor(
    id: string,
    name: string,
    clientOptions: LanguageClientOptions,
    createChannel: () => Channel,
  ) {
    super(id, name, clientOptions)
    this._createChannel = createChannel
  }
  async createMessageTransports(): Promise<MessageTransports> {
    const channel = this._createChannel()

    if (channel instanceof WebSocket) {
      return {
        reader: new WebSocketMessageReader(wsToSocket(channel)),
        writer: new WebSocketMessageWriter(wsToSocket(channel)),
      }
    }

    if (channel instanceof MessagePort) {
      return {
        reader: new WebSocketMessageReader(messagePortToSocket(channel)),
        writer: new WebSocketMessageWriter(messagePortToSocket(channel)),
      }
    }

    return {
      reader: new BrowserMessageReader(channel),
      writer: new BrowserMessageWriter(channel),
    }
  }
}

function messagePortToSocket(port: MessagePort) {
  return {
    send: (content: any) => port.postMessage(content),
    onMessage: (cb: (data: any) => void) => {
      port.onmessage = event => cb(event.data)
    },
    onError: () => {},
    onClose: () => {},
    dispose: () => port.close(),
  }
}

function wsToSocket(webSocket: WebSocket): IWebSocket {
  return {
    send: content => webSocket.send(content),
    onMessage: cb => {
      webSocket.onmessage = event => cb(event.data);
    },
    onError: cb => {
      webSocket.onerror = (event: any) => {
        if (Object.prototype.hasOwnProperty.call(event, 'message')) {
          cb(event.message);
        }
      };
    },
    onClose: cb => {
      webSocket.onclose = event => cb(event.code, event.reason);
    },
    dispose: () => webSocket.close(),
  };
}

export {
  LanguageClient,
}
