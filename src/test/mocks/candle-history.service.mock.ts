import { Service } from "typedi";
import { Candle } from "../../app/models/candle.model";
import TestUtils from "../test-utils";

/**
 * Mock for {@link CandleHistoryDao}
 */
@Service()
export default class CandleHistoryDaoMock {
  has = jest.fn().mockImplementation((key: string) => {
    return key === TestUtils.getDefaultIsin() ? true : false;
  });
  get = jest.fn().mockImplementation((key: string) => {
    const result = new Map<number, Candle>();

    // Tuesday, May 10, 2022 3:15:00 PM - 3:15:59 PM
    result.set(
      1652195700000,
      new Candle(1652195701000, 742.5, 760.6593, 7670, 733.9121, 1652195759000)
    );
    // Tuesday, May 10, 2022 3:16:00 PM - 3:16:59 PM
    result.set(
      1652195760000,
      new Candle(1652195761000, 742.5, 760.6593, 7670, 733.9121, 1652195810000)
    );

    return result;
  });
}
