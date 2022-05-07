import config from "config";
import express from "express";
import "reflect-metadata";
import { Service } from "typedi";
import CandlesticksService from "./services/candlesticks.service";
import {
  InstrumentsStreamService,
  QuotesStreamService,
} from "./services/stream.service";

@Service()
export default class Server {
  constructor(
    private readonly instrumentsStreamService: InstrumentsStreamService,
    private readonly quotesStreamService: QuotesStreamService,
    private readonly candlesticksService: CandlesticksService
  ) {
    // Start express server
    const app = express();

    // API exposed endpoints
    app.get("/candlesticks", (req, res) => {
      res.send("isin: " + req.query.isin);
    });

    // Listen to the specified port, use 9000 if is not defined
    const PORT = config.get("api-port") || 9000;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}...`);
    });
  }

  start() {
    // Connect streams
    this.instrumentsStreamService.connect();
    this.quotesStreamService.connect();
  }
}
