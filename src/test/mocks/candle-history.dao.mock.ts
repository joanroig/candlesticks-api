import { Service } from "typedi";
import { ISIN } from "../../app/models/alias.model";
import { Candle, CandleHistory } from "../../app/models/candle.model";
import TestUtils from "../test-utils";

/**
 * Mock for {@link CandleHistoryDao}
 */
@Service()
export default class CandleHistoryDaoMock {
  // Simulated current time, which can be used to retrieve the two mocked candles
  static getCurrentTime() {
    return 1652195760100;
  }

  private readonly candleHistoryMap = new Map<ISIN, CandleHistory>();

  constructor() {
    const history = new Map<number, Candle>();

    // Time range: Tuesday, May 10, 2022 3:15:00 PM - 3:15:59 PM
    history.set(
      1652195700000,
      new Candle(1652195701000, 742.5, 760.6593, 7670, 733.9121, 1652195759000)
    );
    // Time range: Tuesday, May 10, 2022 3:16:00 PM - 3:16:59 PM
    history.set(
      1652195760000,
      new Candle(1652195761000, 742.5, 760.6593, 7670, 733.9121, 1652195810000)
    );

    this.candleHistoryMap.set(TestUtils.getDefaultIsin1(), history);
  }

  has = jest.fn().mockImplementation((key: string) => {
    return this.candleHistoryMap.has(key);
  });

  get = jest.fn().mockImplementation((key: string) => {
    return this.candleHistoryMap.get(key);
  });

  initialize = jest.fn().mockImplementation((key: string) => {
    return this.candleHistoryMap.set(key, new Map<number, Candle>());
  });
}
