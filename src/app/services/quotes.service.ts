import { transformAndValidateSync } from "class-transformer-validator";
import { Service } from "typedi";
import QuotesDao from "../dao/quotes.dao";
import { QuoteEvent } from "../models/quote.model";
import Utils from "../utils/utils";
import StreamService from "./stream.service";

@Service()
export class QuotesService extends StreamService {
  constructor(private readonly quotesDao: QuotesDao) {
    super("quotes");
  }

  onMessage(data: string) {
    const quoteEvent = transformAndValidateSync(QuoteEvent, data) as QuoteEvent;
    const quote = quoteEvent.data;
    quote.timestamp = Utils.getCurrentTime();
    this.quotesDao.set(quote.isin, quote);
  }
}
