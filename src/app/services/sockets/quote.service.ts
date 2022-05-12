import { Inject, Service } from "typedi";
import PartnerEndpoints from "../../common/constants/partner-endpoints";
import Logger from "../../common/logger/logger";
import InstrumentDao from "../../dao/instrument.dao";
import { Quote, QuoteEvent } from "../../models/quote.model";
import CandleService from "../candles/candle.service";
import Socket from "./socket";

const logger = Logger.getLogger("QuoteService");

/**
 * Service that handles quote data received from the partner
 */
@Service()
export default class QuoteService extends Socket {
  @Inject()
  private readonly candleService: CandleService;

  @Inject()
  protected readonly instrumentsDao: InstrumentDao;

  constructor() {
    super(PartnerEndpoints.QUOTES, QuoteService.name);
  }

  protected onMessage(data: string) {
    // const quoteEvent = transformAndValidateSync(QuoteEvent, data, {
    //   transformer: { excludeExtraneousValues: true },
    // }) as QuoteEvent;
    const quoteEvent: QuoteEvent = JSON.parse(data);
    if (quoteEvent.data?.isin && quoteEvent.data?.price) {
      const quote = quoteEvent.data;
      this.handleQuote(quote);
    } else {
      throw new Error("Quote parsing problem");
    }
  }

  /**
   * Add quote data to the respective candles
   * @param quote
   */
  private handleQuote(quote: Quote) {
    if (!this.instrumentsDao.has(quote.isin)) {
      // logger.error(`No instrument found for the ISIN ${quote.isin}`);
      return;
    }
    this.candleService.parseQuote(quote);
  }
}
