import config from "config";
import moment from "moment";
import { Service } from "typedi";
import { CandlesticksInterface } from "../common/interfaces/candlesticks.interface";
import InstrumentsDao from "../dao/instruments.dao";
import QuotesDao from "../dao/quotes.dao";
import { ISIN } from "../models/aliases.model";
import { Candlestick } from "../models/candlestick.model";
import { Instrument, InstrumentEventType } from "../models/instrument.model";
import { Quote } from "../models/quote.model";
import Utils from "../utils/utils";

@Service()
export default class CandlesticksService implements CandlesticksInterface {
  constructor(
    private readonly instrumentsDao: InstrumentsDao,
    private readonly quotesDao: QuotesDao
  ) {}

  limit = Number(config.get("candlestick-limit"));

  getCandlesticks(isin: ISIN): Candlestick[] {
    if (!this.quotesDao.has(isin)) {
      throw `No quotes found for the ISIN ${isin}`;
    }
    const quotes = this.quotesDao.get(isin);
    const result: Candlestick[] = [];

    // Get the start of the current minute TODO: this can give negative values
    const startTimestamp = moment(Utils.getCurrentTime())
      .endOf("minute")
      .valueOf();

    const groups: Quote[][] = [];

    quotes.forEach((quote) => {
      const diff = startTimestamp - quote.timestamp;
      if (diff < this.limit * 60000) {
        const minute = Math.floor(diff / 60000);
        if (!groups[minute]) {
          groups[minute] = [];
        }
        groups[minute].push(quote);
      }
    });

    //  TODO: set order for candlesticks, iterate the 30 items and copy values of previous if the last does not exists
    groups.forEach((q) => {
      const highPrice = q.reduce((a, b) => (a.price > b.price ? a : b)).price;
      const lowPrice = q.reduce((a, b) => (a.price < b.price ? a : b)).price;
      const open = q.reduce((a, b) => (a.timestamp < b.timestamp ? a : b));
      const close = q.reduce((a, b) => (a.timestamp > b.timestamp ? a : b));

      const candlestick = new Candlestick(
        Utils.formatTime(open.timestamp),
        open.price,
        highPrice,
        lowPrice,
        Utils.formatTime(close.timestamp),
        close.price
      );

      result.push(candlestick);
    });
    return result;
  }

  handleInstrument(instrument: Instrument, eventType: InstrumentEventType) {
    return;
  }

  handleQuote(quote: Quote) {
    return;
  }

  getIsinList(): ISIN[] {
    return this.instrumentsDao.getKeys();
  }
}
