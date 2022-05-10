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
    openPrice: Price,
    highPrice: Price,
    lowPrice: Price,
    closeTimestamp: number,
    closingPrice: Price
  ) {
    this.openTimestamp = openTimestamp;
    this.openPrice = openPrice;
    this.highPrice = highPrice;
    this.lowPrice = lowPrice;
    this.closeTimestamp = closeTimestamp;
    this.closePrice = closingPrice;
  }
  @IsNumber()
  openTimestamp: number;
  @IsNumber()
  openPrice: Price;
  @IsNumber()
  highPrice: Price;
  @IsNumber()
  lowPrice: Price;
  @IsNumber()
  closeTimestamp: number;
  @IsNumber()
  closePrice: Price;
}

export class CandleFormatted {
  @IsString()
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.openTimestamp))
  openTimestamp: number;
  @IsNumber()
  openPrice: Price;
  @IsNumber()
  highPrice: Price;
  @IsNumber()
  lowPrice: Price;
  @IsString()
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.closeTimestamp))
  closeTimestamp: number;
  @IsNumber()
  closePrice: Price;
}
