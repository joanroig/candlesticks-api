import { Price } from "./aliases.model";

export class Candlestick {
  constructor(
    openTimestamp: string,
    openPrice: Price,
    highPrice: Price,
    lowPrice: Price,
    closeTimestamp: string,
    closingPrice: Price
  ) {
    this.openTimestamp = openTimestamp;
    this.openPrice = openPrice;
    this.highPrice = highPrice;
    this.lowPrice = lowPrice;
    this.closeTimestamp = closeTimestamp;
    this.closePrice = closingPrice;
  }
  openTimestamp: string;
  openPrice: Price;
  highPrice: Price;
  lowPrice: Price;
  closeTimestamp: string;
  closePrice: Price;
}
