import { Expose, Transform } from "class-transformer";
import { IsEnum } from "class-validator";
import { ISIN } from "./aliases.model";

export enum InstrumentEventType {
  ADD = "ADD",
  DELETE = "DELETE",
}
export class Instrument {
  @Expose()
  @Transform(({ obj }) => obj.data.isin)
  isin: ISIN;

  @Expose()
  @Transform(({ obj }) => obj.data.description)
  description: string;
}

export class InstrumentEvent {
  @Expose()
  data: Instrument;
  @Expose()
  @IsEnum(InstrumentEventType)
  type: InstrumentEventType;
}
