import { ISIN } from "./aliases.model";

export type Instrument = { isin: ISIN; description: string };

export type InstrumentEvent = { type: InstrumentEventType; data: Instrument };

export enum InstrumentEventType {
  ADD,
  DELETE,
}
