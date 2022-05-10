import { Service } from "typedi";
import { DaoInterface } from "../common/interfaces/dao.interface";
import { ISIN } from "../models/alias.model";
import { Instrument } from "../models/instrument.model";

@Service()
export default class InstrumentDao implements DaoInterface {
  private readonly instruments = new Map<ISIN, Instrument>();

  has(key: string) {
    return this.instruments.has(key);
  }

  get(key: string) {
    return this.instruments.get(key);
  }

  set(key: string, value: Instrument) {
    this.instruments.set(key, value);
  }

  delete(key: string) {
    return this.instruments.delete(key);
  }

  clear() {
    this.instruments.clear();
  }

  getInstruments() {
    return [...this.instruments.values()];
  }

  getKeys() {
    return [...this.instruments.keys()];
  }
}
