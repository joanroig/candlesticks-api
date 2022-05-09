import { transformAndValidateSync } from "class-transformer-validator";
import { Inject, Service } from "typedi";
import { Logger } from "../common/logger/logger";
import Utils from "../common/utils/utils";
import InstrumentsDao from "../dao/instruments.dao";
import { Quote, QuoteEvent } from "../models/quote.model";
import CandlesticksService from "./candlesticks.service";
import StreamService from "./stream.service";

const logger = Logger.getLogger("QuotesService");

@Service()
export default class QuotesService extends StreamService {
  @Inject()
  private readonly instrumentsDao: InstrumentsDao;
  @Inject()
  private readonly candlesticksService: CandlesticksService;

  constructor() {
    super("quotes", QuotesService.name);
  }

  onMessage(data: string) {
    const quoteEvent = transformAndValidateSync(QuoteEvent, data) as QuoteEvent;
    const quote = quoteEvent.data;
    this.handleQuote(quote);
  }

  /**
   * Add quote data to the respective candlestick
   * @param quote
   */
  handleQuote(quote: Quote) {
    if (!this.instrumentsDao.has(quote.isin)) {
      logger.error(`No instrument found for the ISIN ${quote.isin}`);
      return;
    }
    // Add timestamp to the quote
    quote.timestamp = Utils.getCurrentTime();
    this.candlesticksService.parseQuote(quote);
  }
}
