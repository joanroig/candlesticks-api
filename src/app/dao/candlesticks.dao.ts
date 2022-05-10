import { Service } from "typedi";
import configuration from "../common/constants/configuration";
import { DaoInterface } from "../common/interfaces/dao.interface";
import { Logger } from "../common/logger/logger";
import Utils from "../common/utils/utils";
import { ISIN } from "../models/aliases.model";
import { Candlestick, CandlestickHistory } from "../models/candlestick.model";

const logger = Logger.getLogger("CandlesticksDao");

@Service()
export default class CandlesticksDao implements DaoInterface {
  // Candlesticks data structure, where an ISIN identifies a CandlestickHistory
  private readonly candlesticks = new Map<ISIN, CandlestickHistory>();

  constructor() {
    // Schedule clearing old data
    setInterval(() => {
      this.startGarbageCollector();
    }, configuration.CLEAN_SCHEDULE * 60000);
  }

  startGarbageCollector() {
    logger.debug("Clearing old data...");
    let count = 0;
    Array.from(this.candlesticks.values()).filter((history) => {
      Array.from(history.keys()).filter((minute) => {
        if (
          Utils.getCurrentTime() - minute >
          configuration.HISTORY_LIMIT * 60000
        ) {
          history.delete(minute);
          count++;
        }
      });
    });
    logger.debug("Items cleared: ", count);
  }

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

  clear() {
    this.candlesticks.clear();
  }
}
