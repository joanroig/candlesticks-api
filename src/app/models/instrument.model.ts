import { Expose } from "class-transformer";
import { IsEnum, IsNumber, IsString } from "class-validator";
import { ISIN } from "./alias.model";

export enum InstrumentEventType {
  ADD = "ADD",
  DELETE = "DELETE",
}
export class Instrument {
  @IsNumber()
  isin: ISIN;
  @IsString()
  description: string;
}

export class InstrumentEvent {
  @Expose()
  data: Instrument;
  @Expose()
  @IsEnum(InstrumentEventType)
  type: InstrumentEventType;
}
