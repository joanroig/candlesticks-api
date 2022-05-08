import config from "config";
import express from "express";
import "reflect-metadata";
import { Service } from "typedi";
import CandlesticksService from "./services/candlesticks.service";
import { InstrumentsService } from "./services/instruments.service";
import { QuotesService } from "./services/quotes.service";

@Service()
export default class Server {
  constructor(
    private readonly instrumentsStreamService: InstrumentsService,
    private readonly quotesStreamService: QuotesService,
    candlesticksService: CandlesticksService
  ) {
    // Start express server
    const app = express();

    // API exposed endpoints
    app.get("/candlesticks", (req, res) => {
      res.send(candlesticksService.getCandlesticks(req.query.isin as string));
    });

    app.get("/isins", (req, res) => {
      res.send(candlesticksService.getIsinList());
    });

    // Listen to the specified port, use 9000 if not defined
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
