import moment from "moment";
import "reflect-metadata";
import Container from "typedi";
import CandleHistoryDaoMock from "../../../test/mocks/candle-history.dao.mock";
import TestUtils from "../../../test/test-utils";
import configuration from "../../common/constants/configuration";
import InstrumentNotFoundError from "../../common/errors/instrument-not-found-error";
import CandleHistoryDao from "../../dao/candle-history.dao";
import CandleService from "./candle.service";

let service: CandleService;
describe("Candle Service Tests", () => {
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
    const candles = service.getCandles(TestUtils.getDefaultIsin1());
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

    // Test how the system reacts after ten minutes with no quote updates
    for (let minute = 0; minute < 10; minute++) {
      const time = moment(TestUtils.getMockTime())
        .add(minute, "minutes")
        .valueOf();

      TestUtils.mockTimeOnce(time);
      const candles = service.getCandles(TestUtils.getDefaultIsin1());

      let expectedCount = minute + initialResults;

      if (expectedCount >= configuration.HISTORY_LIMIT + initialResults) {
        expectedCount = 0;
      }
      if (expectedCount > configuration.HISTORY_LIMIT) {
        expectedCount = configuration.HISTORY_LIMIT;
      }

      expect(candles).toBeArrayOfSize(expectedCount);

      // Check that all cloned values are correct
      if (expectedCount > 2) {
        const last = candles.length - 1;
        const penultimate = candles.length - 2;
        // Same prices
        expect(candles[last].openPrice).toBe(candles[penultimate].openPrice);
        expect(candles[last].closePrice).toBe(candles[penultimate].closePrice);
        expect(candles[last].highPrice).toBe(candles[penultimate].highPrice);
        expect(candles[last].lowPrice).toBe(candles[penultimate].lowPrice);
        // Latest candles should have later timestamps
        expect(candles[last].openTimestamp).toBeGreaterThan(
          candles[penultimate].openTimestamp
        );
        expect(candles[last].closeTimestamp).toBeGreaterThan(
          candles[penultimate].closeTimestamp
        );
      }
    }
  });

  it("should not find candles", () => {
    expect(() => {
      service.getCandles("WILLNOTEXIST");
    }).toThrow(InstrumentNotFoundError);
  });

  it("should parse quotes that create and modify a candle", () => {
    const time1 = 1652111005000;
    const price1 = 300;

    const time2 = 1652111006000;
    const price2 = 400;

    const time3 = 1652111004000;
    const price3 = 200;

    const isin = TestUtils.getDefaultIsin2();

    // Quote should not exist yet
    expect(() => {
      service.getCandles(isin);
    }).toThrow(InstrumentNotFoundError);

    service.parseQuote({
      isin: isin,
      price: price1,
      timestamp: time1,
    });

    TestUtils.mockTimeOnce(time1);
    let candles = service.getCandles(isin);

    // Check if the quote has been processed properly
    expect(candles).toBeArrayOfSize(1);
    expect(candles[0].openTimestamp).toBe(time1);
    expect(candles[0].closeTimestamp).toBe(time1);
    expect(candles[0].openPrice).toBe(price1);
    expect(candles[0].closePrice).toBe(price1);
    expect(candles[0].highPrice).toBe(price1);
    expect(candles[0].lowPrice).toBe(price1);

    // Send another quote that should update the candle
    service.parseQuote({
      isin: isin,
      price: price2,
      timestamp: time2,
    });

    TestUtils.mockTimeOnce(time2);
    candles = service.getCandles(isin);

    // Check if the quote has been processed properly
    expect(candles).toBeArrayOfSize(1);
    expect(candles[0].openTimestamp).toBe(time1);
    expect(candles[0].closeTimestamp).toBe(time2);
    expect(candles[0].openPrice).toBe(price1);
    expect(candles[0].closePrice).toBe(price2);
    expect(candles[0].highPrice).toBe(price2);
    expect(candles[0].lowPrice).toBe(price1);

    // Send another quote, which is out of order, that should update the candle
    service.parseQuote({
      isin: isin,
      price: price3,
      timestamp: time3,
    });

    TestUtils.mockTimeOnce(time3);
    candles = service.getCandles(isin);

    // Check if the quote has been processed properly
    expect(candles).toBeArrayOfSize(1);
    expect(candles[0].openTimestamp).toBe(time3);
    expect(candles[0].closeTimestamp).toBe(time2);
    expect(candles[0].openPrice).toBe(price3);
    expect(candles[0].closePrice).toBe(price2);
    expect(candles[0].highPrice).toBe(price2);
    expect(candles[0].lowPrice).toBe(price3);
  });
});
