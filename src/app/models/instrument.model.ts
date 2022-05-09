import { Expose } from "class-transformer";
import { IsEnum } from "class-validator";
import { ISIN } from "./aliases.model";

export enum InstrumentEventType {
  ADD = "ADD",
  DELETE = "DELETE",
}
export class Instrument {
  isin: ISIN;
  description: string;
}

export class InstrumentEvent {
  @Expose()
  data: Instrument;
  @Expose()
  @IsEnum(InstrumentEventType)
  type: InstrumentEventType;
}
