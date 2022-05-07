import { Instant, Price } from "./aliases.model";

export type Candlestick = {
  openTimestamp: Instant;
  closeTimestamp: Instant;
  openPrice: Price;
  highPrice: Price;
  lowPrice: Price;
  closingPrice: Price;
};
