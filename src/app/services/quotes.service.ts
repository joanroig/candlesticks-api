import { transformAndValidateSync } from "class-transformer-validator";
import { Service } from "typedi";
import Utils from "../common/utils/utils";
import { QuoteEvent } from "../models/quote.model";
import CandlesticksService from "./candlesticks.service";
import StreamService from "./stream.service";

@Service()
export class QuotesService extends StreamService {
  constructor(private readonly candlesticksService: CandlesticksService) {
    super("quotes");
  }

  onMessage(data: string) {
    const quoteEvent = transformAndValidateSync(QuoteEvent, data) as QuoteEvent;
    const quote = quoteEvent.data;
    quote.timestamp = Utils.getCurrentTime();
    this.candlesticksService.handleQuote(quote);
  }
}
