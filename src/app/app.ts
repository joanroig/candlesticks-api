import express from "express";
import "reflect-metadata";
import { Inject, Service } from "typedi";
import configuration from "./common/constants/configuration";
import endpoints from "./common/constants/endpoints";
import InvalidParametersError from "./common/errors/invalid-parameters-error";
import { Logger } from "./common/logger/logger";
import errorHandler from "./middlewares/error.middleware";
import InstrumentsService from "./services/instruments.service";
import QuotesService from "./services/quotes.service";
import RestService from "./services/rest.service";

const logger = Logger.getLogger("Server");

@Service()
export default class App {
  // Listen to the specified port, use 9000 if not defined
  private readonly HOST = configuration.API_HOST;
  private readonly PORT = configuration.API_PORT;

  @Inject()
  private readonly quotesStreamService: QuotesService;
  @Inject()
  private readonly instrumentsService: InstrumentsService;
  @Inject()
  private readonly restService: RestService;

  private app: express.Application;

  start() {
    // Start express server
    this.app = express();
    this.connectWebservices();
    this.initializeApi();
    this.initializeErrorHandler();
  }

  private connectWebservices() {
    // Connect streams
    this.instrumentsService.connect();
    this.quotesStreamService.connect();
  }

  private initializeErrorHandler() {
    this.app.use(errorHandler);
  }

  private initializeApi() {
    // API exposed endpoints
    this.app.get("/" + endpoints.CANDLES, (req, res) => {
      const isin = req.query.isin as string;
      const sort = req.query.sort as string;
      const format = req.query.format as string;

      if (!isin) {
        throw new InvalidParametersError("isin");
      }

      const result = this.restService.getCandlesticks(isin, sort, format);
      return res.status(200).send(result);
    });

    this.app.get("/" + endpoints.ISIN_LIST, (req, res) => {
      const result = this.restService.getIsinList();
      res.send(result);
    });

    this.app.listen(this.PORT, () => {
      // Print API information
      logger.info(`Server listening on ${this.HOST}:${this.PORT}`);
      logger.info("Exposed endpoints:");
      logger.info(` - ${this.HOST}:${this.PORT}/${endpoints.CANDLES}`);
      logger.info(` - ${this.HOST}:${this.PORT}/${endpoints.ISIN_LIST}`);
    });
  }
}
