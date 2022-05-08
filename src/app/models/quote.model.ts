import { Instant, ISIN, Price } from "./aliases.model";

export class Quote {
  isin: ISIN;
  price: Price;
  timestamp: Instant;
}

export class QuoteEvent {
  data: Quote;
}
