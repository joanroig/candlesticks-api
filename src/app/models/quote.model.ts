import { Expose } from "class-transformer";
import { Instant, ISIN, Price } from "./alias.model";

export class Quote {
  @Expose()
  isin: ISIN;
  @Expose()
  price: Price;
  @Expose()
  timestamp: Instant;
}

export class QuoteEvent {
  @Expose()
  data: Quote;
}
