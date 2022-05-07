import config from "config";
import WebSocket from "ws";

class QuoteStreamService {
  streamUrl = config.get("stream-url");
  ws = new WebSocket("ws://" + this.streamUrl + "/quotes");

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

export default new QuoteStreamService();
