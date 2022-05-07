import { Service } from "typedi";
import { CandlesticksInterface } from "../common/interfaces/candlesticks.interface";
import { ISIN } from "../models/aliases.model";
import { Candlestick } from "../models/candlestick.model";
import { Instrument, InstrumentEventType } from "../models/instrument.model";
import { Quote } from "../models/quote.model";

@Service()
export default class CandlesticksService implements CandlesticksInterface {
  getCandlesticks(isin: ISIN): Candlestick[] {
    return [];
  }

  handleInstrument(instrument: Instrument, eventType: InstrumentEventType) {
    return;
  }

  handleQuote(quote: Quote) {
    return;
  }
}
