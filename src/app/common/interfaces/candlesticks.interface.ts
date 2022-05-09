import { ISIN } from "../../models/aliases.model";
import { Candlestick } from "../../models/candlestick.model";

export interface CandlesticksInterface {
  /**
   * Get candlesticks by isin for last 30 minutes
   * @param isin ISIN to be checked
   * @returns list of candlesticks, one per minute
   */
  getCandlesticks: (isin: ISIN) => Candlestick[];

  // /**
  //  * Handle instrument event
  //  * @param instrument instrument object identified by its ISIN
  //  * @param eventType action to do with the instrument, like adding or removing it
  //  * @returns
  //  */
  // handleInstrument: (
  //   instrument: Instrument,
  //   eventType: InstrumentEventType
  // ) => void;

  // /**
  //  * Handle quote event
  //  * @param quote quote object that targets an instrument identified by the ISIN
  //  * @returns
  //  */
  // handleQuote: (quote: Quote) => void;
}
