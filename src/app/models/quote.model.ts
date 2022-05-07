import { ISIN, Price } from "./aliases.model";

export type Quote = { isin: ISIN; price: Price };

export type QuoteEvent = { data: Quote };
