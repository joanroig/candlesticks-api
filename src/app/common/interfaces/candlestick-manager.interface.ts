import { ISIN } from "../../models/aliases.model";
import { Candlestick } from "../../models/candlestick.model";
import { Instrument, InstrumentEventType } from "../../models/instrument.model";
import { Quote } from "../../models/quote.model";

export interface CandlestickManager {
  getCandlesticks: (isin: ISIN) => Candlestick[];
  handleInstrument: (
    instrument: Instrument,
    eventType: InstrumentEventType
  ) => void;
  handleQuote: (quote: Quote) => void;
}
