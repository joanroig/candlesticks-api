import { Expose, Transform } from "class-transformer";
import { IsNumber, IsString } from "class-validator";
import Utils from "../common/utils/utils";
import { Price } from "./alias.model";

/**
 * Map where the key identifies the start of a minute in unix format, and the value is a candle object
 */
export type CandleHistory = Map<number, Candle>;

export class Candle {
  constructor(
    openTimestamp: number,
    closeTimestamp: number,
    openPrice: Price,
    closePrice: Price,
    highPrice: Price,
    lowPrice: Price
  ) {
    this.openTimestamp = openTimestamp;
    this.closeTimestamp = closeTimestamp;
    this.openPrice = openPrice;
    this.closePrice = closePrice;
    this.highPrice = highPrice;
    this.lowPrice = lowPrice;
  }
  @IsNumber()
  openTimestamp: number;
  @IsNumber()
  closeTimestamp: number;
  @IsNumber()
  openPrice: Price;
  @IsNumber()
  closePrice: Price;
  @IsNumber()
  highPrice: Price;
  @IsNumber()
  lowPrice: Price;
}

export class CandleFormatted {
  @IsString()
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.openTimestamp))
  openTimestamp: number;
  @IsString()
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.closeTimestamp))
  closeTimestamp: number;
  @IsNumber()
  openPrice: Price;
  @IsNumber()
  closePrice: Price;
  @IsNumber()
  highPrice: Price;
  @IsNumber()
  lowPrice: Price;
}
