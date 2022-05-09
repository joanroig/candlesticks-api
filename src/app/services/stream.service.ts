import WebSocket from "ws";
import configuration from "../common/constants/configuration";
import { Logger } from "../common/logger/logger";

/**
 * Base class to be extended for each resource that needs to be tracked
 */
export default class StreamService {
  logger;

  resourceName: string;
  ws: WebSocket;
  streamUrl = configuration.SOCKETS_URL;
  reconnectTime = configuration.SOCKETS_RECONNECT_TIME;

  /**
   * Connect to the websocket
   * @param resourceName resource name used in the ws url
   */
  constructor(resourceName: string, className: string) {
    this.resourceName = resourceName;
    this.logger = Logger.getLogger(className);
  }

  connect() {
    if (this.streamUrl && this.resourceName) {
      this.ws = new WebSocket(`ws://${this.streamUrl}/${this.resourceName}`);
    } else {
      this.logger.error(
        `Could not open Socket for ${this.resourceName} ${this.streamUrl}`
      );
    }

    this.ws.onopen = () => {
      this.logger.info(`Socket connected: ${this.resourceName}`);
    };

    this.ws.onclose = (e) => {
      this.logger.error(
        `Socket for ${this.resourceName} closed. Reconnecting in ${this.reconnectTime} seconds.`
      );
      setTimeout(() => {
        this.connect();
      }, this.reconnectTime * 1000);
    };

    this.ws.onmessage = (data) => {
      this.onMessage(String(data.data));
    };

    this.ws.onerror = (err) => {
      this.logger.error(`Socket error: ${err.message}`);
      this.ws.close();
    };
  }

  onMessage(data: string) {
    this.logger.info(`${data}`);
  }
}
