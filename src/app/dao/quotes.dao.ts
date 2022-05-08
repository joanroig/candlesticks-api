import { Service } from "typedi";
import { DaoInterface } from "../common/interfaces/dao.interface";
import { ISIN } from "../models/aliases.model";
import { Quote } from "../models/quote.model";

@Service()
export default class QuotesDao implements DaoInterface {
  quotes = new Map<ISIN, Quote[]>();

  has(key: string) {
    return this.quotes.has(key);
  }

  get(key: string) {
    return this.quotes.get(key);
  }

  set(key: string, value: Quote) {
    this.quotes.has(key) ? "" : this.quotes.set(key, []);
    const quoteList = this.quotes.get(key);
    quoteList.push(value);
    this.quotes.set(key, quoteList);
  }

  delete(key: string) {
    return this.quotes.delete(key);
  }
}
