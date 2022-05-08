import { Service } from "typedi";
import { DaoInterface } from "../common/interfaces/dao.interface";
import { ISIN } from "../models/aliases.model";
import { Candlestick, CandlestickHistory } from "../models/candlestick.model";

@Service()
export default class CandlesticksDao implements DaoInterface {
  // Candlesticks data structure, where an ISIN identifies a CandlestickHistory
  private candlesticks = new Map<ISIN, CandlestickHistory>();

  has(key: string) {
    return this.candlesticks.has(key);
  }

  get(key: string) {
    return this.candlesticks.get(key);
  }

  initialize(key: string) {
    this.candlesticks.set(key, new Map<number, Candlestick>());
  }

  set(key: string, value: CandlestickHistory) {
    this.candlesticks.set(key, value);
  }

  delete(key: string) {
    return this.candlesticks.delete(key);
  }
}
