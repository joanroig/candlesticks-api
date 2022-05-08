import config from "config";
import { Service } from "typedi";
import { CandlesticksInterface } from "../common/interfaces/candlesticks.interface";
import Utils from "../common/utils/utils";
import CandlesticksDao from "../dao/candlesticks.dao";
import InstrumentsDao from "../dao/instruments.dao";
import { ISIN } from "../models/aliases.model";
import { Candlestick } from "../models/candlestick.model";
import { Instrument, InstrumentEventType } from "../models/instrument.model";
import { Quote } from "../models/quote.model";

@Service()
export default class CandlesticksService implements CandlesticksInterface {
  constructor(
    private readonly instrumentsDao: InstrumentsDao,
    private readonly candlesticksDao: CandlesticksDao
  ) {}

  limit = Number(config.get("candlestick-limit"));

  /**
   * Get the candlesticks of an instrument
   * @param isin Calculate candlesticks of a given isin
   * @returns candlestick list
   */
  getCandlesticks(isin: ISIN): Candlestick[] {
    if (!this.candlesticksDao.has(isin)) {
      throw `No candlesticks found for the ISIN ${isin}`;
    }

    const candles = this.candlesticksDao.get(isin);

    const now = Utils.getStartOfMinute(Utils.getCurrentTime());
    const startRange = now - this.limit * 60000;

    const result: Candlestick[] = [];
    let previous: Candlestick;

    for (let i = 0; i <= this.limit; i++) {
      const id = startRange + i * 60000;
      const candle = candles.get(id);
      if (candle) {
        result.push(candle);
        previous = candle;
      } else if (previous) {
        // Reuse previous candle for filling gaps
        result.push(previous);
      }
    }

    return result;
  }

  handleInstrument(instrument: Instrument, eventType: InstrumentEventType) {
    return;
  }

  /**
   * Add quote data to the respective candlestick
   * @param quote
   */
  handleQuote(quote: Quote) {
    if (!this.instrumentsDao.has(quote.isin)) {
      throw `No instrument found for the ISIN ${quote.isin}`;
    }

    if (!this.candlesticksDao.has(quote.isin)) {
      this.candlesticksDao.initialize(quote.isin);
    }
    const candlesticks = this.candlesticksDao.get(quote.isin);

    // Timestamp of the minute of the candlestick
    const minute = Utils.getStartOfMinute(quote.timestamp);

    let candlestick: Candlestick;
    if (candlesticks.has(minute)) {
      const previous = candlesticks.get(minute);
      candlestick = this.updateCandlestick(previous, quote);
    } else {
      // Add new Candlestick
      candlestick = new Candlestick(
        quote.timestamp,
        quote.price,
        quote.price,
        quote.price,
        quote.timestamp,
        quote.price
      );
    }

    // Save candlestick
    candlesticks.set(minute, candlestick);

    // not needed, the object is updated by reference
    // this.candlesticksDao.set(quote.isin, candlesticks);
  }

  /**
   * Edit a candlestick taking into account that the quote can be out of order
   * @param candlestick
   * @param quote
   */
  updateCandlestick(candlestick: Candlestick, quote: Quote) {
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

  getIsinList(): ISIN[] {
    return this.instrumentsDao.getKeys();
  }
}
