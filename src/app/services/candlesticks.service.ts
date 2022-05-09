import config from "config";
import { Inject, Service } from "typedi";
import configuration from "../common/constants/configuration";
import InstrumentNotFoundError from "../common/errors/instrument-not-found-error";
import { CandlesticksInterface } from "../common/interfaces/candlesticks.interface";
import Utils from "../common/utils/utils";
import CandlesticksDao from "../dao/candlesticks.dao";
import { ISIN } from "../models/aliases.model";
import { Candlestick } from "../models/candlestick.model";
import { Quote } from "../models/quote.model";

@Service()
export default class CandlesticksService implements CandlesticksInterface {
  @Inject()
  private readonly candlesticksDao: CandlesticksDao;

  private readonly limit = configuration.CANDLESTICK_LIMIT;

  /**
   * Get the candlesticks of an instrument
   * @param isin Calculate candlesticks of a given isin
   * @returns candlestick list
   */
  getCandlesticks(isin: ISIN): Candlestick[] {
    if (!this.candlesticksDao.has(isin)) {
      throw new InstrumentNotFoundError(isin);
    }

    const candles = this.candlesticksDao.get(isin);

    const now = Utils.getStartOfMinute(Utils.getCurrentTime());
    const startRange = now - this.limit * 60000;

    const result: Candlestick[] = [];
    let previous: Candlestick;

    for (let i = 1; i <= this.limit; i++) {
      const id = startRange + i * 60000;
      const candle = candles.get(id);
      if (candle) {
        result.push(candle);
        previous = candle;
      } else if (previous) {
        // Reuse previous candle for filling gaps, change the timings to the start of the corresponding minute
        const clone = { ...previous };
        clone.openTimestamp = startRange + i * 60000;
        clone.closeTimestamp = clone.openTimestamp;
        result.push(clone);
      }
    }

    return result;
  }

  /**
   * Add quote data to the respective candlestick
   * @param quote
   */
  parseQuote(quote: Quote) {
    if (!this.candlesticksDao.has(quote.isin)) {
      this.candlesticksDao.initialize(quote.isin);
    }
    const candlesticks = this.candlesticksDao.get(quote.isin);

    // Minute of the candlestick
    const minute = Utils.getStartOfMinute(quote.timestamp);

    let candlestick: Candlestick;
    if (candlesticks.has(minute)) {
      const previous = candlesticks.get(minute);
      candlestick = this.updateCandlestick(previous, quote);
    } else {
      // Add new Candlestick
      candlestick = this.createCandlestick(quote);
    }

    // Save candlestick, which is saved into the candlesticks dao by reference
    candlesticks.set(minute, candlestick);

    // If using a database, save it here
  }

  private createCandlestick(quote: Quote) {
    return new Candlestick(
      quote.timestamp,
      quote.price,
      quote.price,
      quote.price,
      quote.timestamp,
      quote.price
    );
  }

  /**
   * Edit a candlestick taking into account that the quote can be out of order
   * @param candlestick
   * @param quote
   */
  private updateCandlestick(candlestick: Candlestick, quote: Quote) {
    // Update open and close data
    if (quote.timestamp < candlestick.openTimestamp) {
      candlestick.openTimestamp = quote.timestamp;
      candlestick.openPrice = quote.price;
    }
    if (quote.timestamp > candlestick.closeTimestamp) {
      candlestick.closeTimestamp = quote.timestamp;
      candlestick.closePrice = quote.price;
    }
    // Update prices
    if (quote.price > candlestick.highPrice) {
      candlestick.highPrice = quote.price;
    }
    if (quote.price < candlestick.lowPrice) {
      candlestick.lowPrice = quote.price;
    }
    return candlestick;
  }
}
