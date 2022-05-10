import "reflect-metadata";
import Container from "typedi";
import { Instrument } from "../models/instrument.model";
import InstrumentDao from "./instrument.dao";

let dao: InstrumentDao;
describe("Instrument Dao Tests", () => {
  beforeAll(() => {
    // Get the class we want to test
    dao = Container.get(InstrumentDao);
  });

  afterAll(() => {
    Container.reset();
  });

  const isin = "demo";
  const instrument = { isin, description: "demo" } as Instrument;

  it("should create, delete, and update instruments", () => {
    expect(dao.has(isin)).toBeFalse();

    // Set instrument and check if it exists
    dao.set(isin, instrument);
    const retrievedInstrument = dao.get(isin);
    expect(retrievedInstrument).toBe(instrument);
    expect(dao.getInstruments().length).toBe(1);
    expect(dao.getKeys().length).toBe(1);
    expect(dao.getKeys()).toContain(isin);

    // Delete instrument and check if it does not exist
    dao.delete(isin);
    expect(dao.has(isin)).toBeFalse();
    expect(dao.get(isin)).toBe(undefined);

    // Add and then clear instrument and check if it exists
    dao.set(isin, instrument);
    expect(dao.get(isin)).toBe(instrument);
    dao.clear();
    expect(dao.get(isin)).toBe(undefined);
  });
});
