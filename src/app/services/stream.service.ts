import config from "config";
import WebSocket from "ws";

/**
 * Base class to be extended for each resource that needs to be tracked
 */
export default class StreamService {
  resourceName: string;
  ws: WebSocket;
  streamUrl = config.get("stream-url");

  /**
   * Connect to the websocked
   * @param resourceName resource name used in the ws url
   */
  constructor(resourceName: string) {
    this.resourceName = resourceName;
    if (this.streamUrl && this.resourceName) {
      this.ws = new WebSocket(`ws://${this.streamUrl}/${this.resourceName}`);
    } else {
      console.error(
        `Could not open WebSocket for ${resourceName} ${this.streamUrl}`
      );
    }
  }

  connect() {
    this.ws.on("open", () => {
      console.log("connected");
    });

    this.ws.on("close", () => {
      console.log("disconnected");
    });

    this.ws.on("message", (data) => this.onMessage(String(data)));
  }

  onMessage(data: string) {
    console.log(`${data}`);
  }
}
