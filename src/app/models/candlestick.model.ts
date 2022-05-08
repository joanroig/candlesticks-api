import { Expose, Transform } from "class-transformer";
import Utils from "../common/utils/utils";
import { Price } from "./aliases.model";

export type CandlestickHistory = Map<number, Candlestick>;

export class Candlestick {
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
  openTimestamp: number;
  openPrice: Price;
  highPrice: Price;
  lowPrice: Price;
  closeTimestamp: number;
  closePrice: Price;
}

export class CandlestickFormatted {
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.openTimestamp))
  openTimestamp: number;
  openPrice: Price;
  highPrice: Price;
  lowPrice: Price;
  @Expose()
  @Transform(({ obj }) => Utils.formatTime(obj.closeTimestamp))
  closeTimestamp: number;
  closePrice: Price;
}
