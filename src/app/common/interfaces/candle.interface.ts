import { ISIN } from "../../models/alias.model";
import { Candle } from "../../models/candle.model";
import { Quote } from "../../models/quote.model";

export interface ICandleService {
  /**
   * Get the candles of an instrument
   * @param isin Calculate candles of a given isin
   * @returns candle list
   */
  getCandles: (isin: ISIN) => Candle[];

  /**
   * Parse quote to update a candle
   * @param quote quote object of an instrument identified by the isin
   */
  parseQuote: (quote: Quote) => void;
}
