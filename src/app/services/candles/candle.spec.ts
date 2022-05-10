import moment from "moment";
import "reflect-metadata";
import Container from "typedi";
import CandleHistoryDaoMock from "../../../test/mocks/candle-history.service.mock";
import TestUtils from "../../../test/test-utils";
import configuration from "../../common/constants/configuration";
import InstrumentNotFoundError from "../../common/errors/instrument-not-found-error";
import CandleHistoryDao from "../../dao/candle-history.dao";
import CandleService from "./candle.service";

let service: CandleService;
describe("API routes", () => {
  beforeAll(() => {
    // Prepare mocks and set them in the container
    Container.set(CandleHistoryDao, new CandleHistoryDaoMock());
    // Get the class we want to test
    service = Container.get(CandleService);
  });

  afterAll(() => {
    Container.reset();
  });

  it("should find two candles", () => {
    // Mock time
    TestUtils.mockTimeOnce(TestUtils.getMockTime());
    const candles = service.getCandles(TestUtils.getDefaultIsin());
    expect(candles).toBeArrayOfSize(2);
  });

  /**
   * Test how the candle results grow every minute by filling gaps.
   * The amount of candles should not be greater than the history limit, and should be 0 if too much time has passed.
   *
   * Test table: left value is the minute offset from start time, and right value is the expected amount of candles.
   *
   * 0 - 2
   * 1 - 3
   * 2 - 4
   * 4 - 5
   * 5 - 5
   * 6 - 0
   * 7 - 0
   */
  it("should get an increasing amount of candles every minute because of the fill method", () => {
    const initialResults = 2;

    for (let gap = 0; gap < 10; gap++) {
      const after = moment(TestUtils.getMockTime())
        .add(gap, "minutes")
        .valueOf();

      TestUtils.mockTimeOnce(after);
      const candles = service.getCandles(TestUtils.getDefaultIsin());

      let expectedCount = gap + initialResults;

      if (expectedCount >= configuration.HISTORY_LIMIT + initialResults) {
        expectedCount = 0;
      }
      if (expectedCount > configuration.HISTORY_LIMIT) {
        expectedCount = configuration.HISTORY_LIMIT;
      }

      expect(candles).toBeArrayOfSize(expectedCount);
    }
  });

  it("should not find candles", () => {
    expect(() => {
      service.getCandles("WILLNOTEXIST");
    }).toThrow(InstrumentNotFoundError);
  });

  it("should parse a quote", () => {
    expect(() => {
      service.getCandles("WILLNOTEXIST");
    }).toThrow(InstrumentNotFoundError);
  });
});
