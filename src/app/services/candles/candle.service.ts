import { Inject, Service } from "typedi";
import configuration from "../../common/constants/configuration";
import InstrumentNotFoundError from "../../common/errors/instrument-not-found-error";
import { ICandleService } from "../../common/interfaces/candle.interface";
import Utils from "../../common/utils/utils";
import CandleHistoryDao from "../../dao/candle.dao";
import { ISIN } from "../../models/alias.model";
import { Candle } from "../../models/candle.model";
import { Quote } from "../../models/quote.model";

@Service()
export default class CandleService implements ICandleService {
  @Inject()
  private readonly candleDao: CandleHistoryDao;

  private readonly limit = configuration.HISTORY_LIMIT;

  getCandles(isin: ISIN): Candle[] {
    if (!this.candleDao.has(isin)) {
      throw new InstrumentNotFoundError(isin);
    }

    const history = this.candleDao.get(isin);

    const currentMinute = Utils.getStartOfMinute(Utils.getCurrentTime());
    const startMinute = currentMinute - this.limit * 60000;

    const result: Candle[] = [];
    let previous: Candle;

    // Iterate from the first minute to the current minute
    for (let i = 1; i <= this.limit; i++) {
      // Unix time that represents the minute of the candle we look for
      const minute = startMinute + i * 60000;
      // Check if the candle exists in the history
      const candle = history.get(minute);
      if (candle) {
        result.push(candle);
        previous = candle;
      } else if (previous) {
        // Reuse previous candle for filling gaps
        const clone = { ...previous };
        // Change the timings to the start of the corresponding minute
        clone.openTimestamp = startMinute + i * 60000;
        clone.closeTimestamp = clone.openTimestamp;
        result.push(clone);
      }
    }
    return result;
  }

  parseQuote(quote: Quote) {
    if (!this.candleDao.has(quote.isin)) {
      this.candleDao.initialize(quote.isin);
    }
    const history = this.candleDao.get(quote.isin);

    // Unix time that represents the minute of a candle
    const minute = Utils.getStartOfMinute(quote.timestamp);

    let candle: Candle;
    if (history.has(minute)) {
      // Update existing candle
      const previous = history.get(minute);
      candle = this.updateCandle(previous, quote);
    } else {
      // Add new candle
      candle = this.createCandle(quote);
    }

    // Save candle into the candles dao by reference
    history.set(minute, candle);
  }

  /**
   * Create a candle from a quote. Note that all prices and times are the same respectively.
   * @param quote quote object
   * @returns created candle
   */
  private createCandle(quote: Quote) {
    return new Candle(
      quote.timestamp,
      quote.price,
      quote.price,
      quote.price,
      quote.timestamp,
      quote.price
    );
  }

  /**
   * Edit a candle taking into account that the quote can be out of order
   * @param candle candle to update
   * @param quote quote object
   * @returns updated candle
   */
  private updateCandle(candle: Candle, quote: Quote) {
    // Update open and close data
    if (quote.timestamp < candle.openTimestamp) {
      candle.openTimestamp = quote.timestamp;
      candle.openPrice = quote.price;
    }
    if (quote.timestamp > candle.closeTimestamp) {
      candle.closeTimestamp = quote.timestamp;
      candle.closePrice = quote.price;
    }
    // Update prices
    if (quote.price > candle.highPrice) {
      candle.highPrice = quote.price;
    }
    if (quote.price < candle.lowPrice) {
      candle.lowPrice = quote.price;
    }
    return candle;
  }
}
