import "reflect-metadata";
import Container from "typedi";
import TestUtils from "../../test/test-utils";
import configuration from "../common/constants/configuration";
import Utils from "../common/utils/utils";
import { Instant } from "../models/alias.model";
import { Candle, CandleHistory } from "../models/candle.model";
import CandleHistoryDao from "./candle-history.dao";

let dao: CandleHistoryDao;
describe("Candle History Dao Tests", () => {
  const isin = "demo";
  const time = 10000000000;
  let candle1: Candle;
  let candle2: Candle;
  let history: CandleHistory;

  beforeEach(() => {
    candle1 = new Candle(1, 1, 1, 1, 1, 1);
    candle2 = new Candle(1, 1, 1, 1, 1, 1);
    history = new Map<Instant, Candle>();
  });

  afterEach(() => {
    dao.stopGarbageCollector();
    Container.reset();
  });

  it("should create, delete, and update candles", () => {
    // Get the class we want to test
    dao = Container.get(CandleHistoryDao);

    expect(dao.has(isin)).toBeFalse();

    // Initialize and check if it exists, history map should be empty
    dao.initialize(isin);
    expect(dao.has(isin)).toBeTrue();
    expect(dao.get(isin).size).toBe(0);

    // Set history with candles and check if they have the proper data
    history.set(time, candle1);
    dao.set(isin, history);
    const retrievedHistory = dao.get(isin);
    expect(retrievedHistory.size).toBe(1);
    expect(retrievedHistory.get(time)).toBe(candle1);

    // Update candle by reference and check if it is updated
    retrievedHistory.set(time, candle2);
    expect(retrievedHistory.get(time)).toBe(candle2);

    // Delete history and check if it does not exist
    dao.delete(isin);
    expect(dao.has(isin)).toBeFalse();
    expect(dao.get(isin)).toBe(undefined);

    // Add and then clear history and check if it exists
    dao.set(isin, history);
    expect(dao.get(isin).size).toBe(1);

    // Clear all
    dao.clear();
    expect(dao.get(isin)).toBe(undefined);
  });

  it("should start the garbage collector and clear old values", async () => {
    // Set the garbage collector to run every 60 miliseconds (60000 * 0,001).
    // Note: To clear a defineProperty the Container needs to be reset (see afterEach)
    Object.defineProperty(configuration, "CLEAN_SCHEDULE", {
      value: 0.001,
    });

    // Get the class we want to test
    dao = Container.get(CandleHistoryDao);

    // Initialize and check if it exists, history map should be empty
    dao.initialize(isin);
    expect(dao.has(isin)).toBeTrue();
    expect(dao.get(isin).size).toBe(0);

    // Set history with candles, one very old and one generated right now, and check if they exist
    history.set(time, candle1);
    history.set(Utils.getCurrentTime(), candle2);
    dao.set(isin, history);
    const retrievedHistory = dao.get(isin);
    expect(retrievedHistory.size).toBe(2);

    // Wait to trigger the garbage collector
    await TestUtils.wait(100);

    // Check if garbage collector removed the expired candle
    expect(dao.get(isin).size).toBe(1);
  });
});
