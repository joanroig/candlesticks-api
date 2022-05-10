import { Service } from "typedi";
import configuration from "../common/constants/configuration";
import { DaoInterface } from "../common/interfaces/dao.interface";
import Logger from "../common/logger/logger";
import Utils from "../common/utils/utils";
import { ISIN } from "../models/alias.model";
import { Candle, CandleHistory } from "../models/candle.model";

const logger = Logger.getLogger("CandleHistoryDao");

@Service()
export default class CandleHistoryDao implements DaoInterface {
  // Candle history map, where an ISIN identifies a CandleHistory
  private readonly candleHistoryMap = new Map<ISIN, CandleHistory>();

  constructor() {
    // Schedule clearing old data
    setInterval(() => {
      this.startGarbageCollector();
    }, configuration.CLEAN_SCHEDULE * 60000);
  }

  startGarbageCollector() {
    logger.debug("Clearing old data...");
    let count = 0;
    Array.from(this.candleHistoryMap.values()).filter((history) => {
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
    return this.candleHistoryMap.has(key);
  }

  /**
   * Return the candlestick history of a given isin
   * @param key isin
   * @returns candlestick history
   */
  get(key: string): CandleHistory {
    return this.candleHistoryMap.get(key);
  }

  initialize(key: string) {
    this.candleHistoryMap.set(key, new Map<number, Candle>());
  }

  set(key: string, value: CandleHistory) {
    this.candleHistoryMap.set(key, value);
  }

  delete(key: string) {
    return this.candleHistoryMap.delete(key);
  }

  clear() {
    this.candleHistoryMap.clear();
  }
}
