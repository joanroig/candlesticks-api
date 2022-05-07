import config from "config";
import { Service } from "typedi";
import WebSocket from "ws";

/**
 * Base class to be extended for each resource that needs to be tracked
 */
class StreamService {
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

    this.ws.on("message", (data) => {
      console.log(`Data: ${data}`);
    });
  }
}

@Service()
export class InstrumentsStreamService extends StreamService {
  constructor() {
    super("instruments");
  }
}

@Service()
export class QuotesStreamService extends StreamService {
  constructor() {
    super("quotes");
  }
}
