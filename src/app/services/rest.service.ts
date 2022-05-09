import { Inject, Service } from "typedi";
import Utils from "../common/utils/utils";
import { ISIN } from "../models/aliases.model";
import { Candlestick, CandlestickFormatted } from "../models/candlestick.model";
import CandlesticksService from "./candlesticks.service";
import InstrumentsService from "./instruments.service";

@Service()
export default class RestService {
  @Inject()
  private readonly candlesticksService: CandlesticksService;

  @Inject()
  private readonly instrumentsService: InstrumentsService;

  getCandlesticks(isin: ISIN, sort: string, format: string) {
    let candlesticks: Candlestick[] | CandlestickFormatted[] =
      this.candlesticksService.getCandlesticks(isin);

    if (sort === "asc") {
      candlesticks = candlesticks.reverse();
    }

    if (format === "true") {
      candlesticks = Utils.formatCandlesticks(candlesticks);
    }

    return candlesticks;
  }

  getIsinList() {
    return this.instrumentsService.getIsinList();
  }
}
