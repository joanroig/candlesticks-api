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
  private garbageCollectorInterval;

  constructor() {
    // Schedule clearing old data, only candles that surpassed the history limit will be removed
    if (configuration.CLEAN_SCHEDULE > 0) {
      this.garbageCollectorInterval = setInterval(() => {
        this.startGarbageCollector();
      }, configuration.CLEAN_SCHEDULE * 60000);
    }
  }

  has(key: string) {
    return this.candleHistoryMap.has(key);
  }

  /**
   * Return the candle history of a given isin
   * @param key isin
   * @returns candle history
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

  countTotalCandles() {
    const list = [...this.candleHistoryMap.values()];
    return list.reduce(
      (accumulator, currentValue) => accumulator + currentValue.size,
      0
    );
  }

  stopGarbageCollector() {
    if (this.garbageCollectorInterval) {
      clearInterval(this.garbageCollectorInterval);
    }
  }

  private startGarbageCollector() {
    logger.debug("Clearing old data...");
    let count = 0;
    Array.from(this.candleHistoryMap.values()).forEach((history) => {
      Array.from(history.keys()).forEach((minute) => {
        if (
          Utils.getCurrentTime() - minute >
          configuration.HISTORY_LIMIT * 60000
        ) {
          history.delete(minute);
          count++;
        }
      });
    });
    logger.debug(`Items cleared: ${count}`);
  }
}
