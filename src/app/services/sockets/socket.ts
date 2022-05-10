import EventEmitter from "events";
import TypedEmitter from "typed-emitter";
import WebSocket from "ws";
import configuration from "../../common/constants/configuration";
import { SocketInterface } from "../../common/interfaces/socket.interface";
import Logger from "../../common/logger/logger";
import { SocketEvent } from "../../models/socket-event.model";

/**
 * Base class to be extended for each socket that needs to be used
 */
export default abstract class Socket implements SocketInterface {
  logger;

  resourceName: string;
  ws: WebSocket;
  streamUrl = configuration.SOCKETS_URL;

  eventEmitter = new EventEmitter() as TypedEmitter<SocketEvent>;

  /**
   * Initialize parameters of the WebSocket.
   * @param resourceName resource name used in the ws url
   * @param className class name to be printed in the logs
   */
  constructor(resourceName: string, className: string) {
    this.resourceName = resourceName;
    this.logger = Logger.getLogger(className);
  }

  /**
   * Create a new WebSocket and listen to updates
   * @returns
   */
  connect(): TypedEmitter<SocketEvent> {
    if (this.streamUrl && this.resourceName) {
      this.ws = new WebSocket(`ws://${this.streamUrl}/${this.resourceName}`);
    } else {
      this.logger.error(
        `Could not open Socket for ${this.resourceName} ${this.streamUrl}`
      );
    }

    this.ws.onopen = () => {
      this.onOpen();
    };

    this.ws.onclose = (e) => {
      this.onClose(e);
    };

    this.ws.onmessage = (data) => {
      this.onMessage(String(data.data));
    };

    this.ws.onerror = (err) => {
      this.onError(err);
    };

    return this.eventEmitter;
  }

  /**
   * If the socket is open, disconnect it
   */
  disconnect() {
    this.ws?.close();
  }

  /**
   * Protected method executed when data is received. Override it to use the data.
   * @param data socket data in string format
   */
  protected onMessage(data: string) {
    this.logger.info(`${data}`);
  }

  private onOpen() {
    this.logger.info(`Socket connected: ${this.resourceName}`);
    this.eventEmitter.emit("connected");
  }

  private onClose(event: WebSocket.CloseEvent) {
    this.logger.error(`Socket for ${this.resourceName} closed.`);
    this.eventEmitter.emit("disconnected");
  }

  private onError(error: WebSocket.ErrorEvent) {
    this.logger.error(`Socket error: ${error.message}`);
    this.ws.close();
  }
}
