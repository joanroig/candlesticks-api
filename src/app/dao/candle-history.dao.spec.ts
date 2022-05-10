import "reflect-metadata";
import Container from "typedi";
import { Candle } from "../models/candle.model";
import CandleHistoryDao from "./candle-history.dao";

let dao: CandleHistoryDao;
describe("Candle History Dao Tests", () => {
  beforeAll(() => {
    // Get the class we want to test
    dao = Container.get(CandleHistoryDao);
  });

  afterAll(() => {
    Container.reset();
  });

  const isin = "demo";
  const time = 10000000000;
  const candle1 = new Candle(1, 1, 1, 1, 1, 1);
  const candle2 = new Candle(1, 1, 1, 1, 1, 1);
  const history = new Map<number, Candle>();
  history.set(time, candle1);

  it("should create, delete, and update candles", () => {
    expect(dao.has(isin)).toBeFalse();

    // Initialize and check if it exists, history map should be empty
    dao.initialize(isin);
    expect(dao.has(isin)).toBeTrue();
    expect(dao.get(isin).size).toBe(0);

    // Set history with candles and check if they have the proper data
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

    dao.clear();
    expect(dao.get(isin)).toBe(undefined);
  });
});
