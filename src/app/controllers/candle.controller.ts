// HelloWorldController.ts
import "reflect-metadata";
import { Controller, Get, QueryParam } from "routing-controllers";
import { OpenAPI } from "routing-controllers-openapi";
import { Inject, Service } from "typedi";
import Endpoints from "../common/constants/endpoints";
import SortMode from "../common/constants/sortMode";
import InvalidParametersError from "../common/errors/invalid-parameters-error";
import Utils from "../common/utils/utils";
import { Candle, CandleFormatted } from "../models/candle.model";
import CandleService from "../services/candles/candle.service";

@Service()
@Controller(`/${Endpoints.CANDLES}`)
export default class CandleController {
  @Inject()
  private readonly candleService: CandleService;

  @Get("/")
  @OpenAPI({
    responses: {
      "404": {
        description: "Instrument with given isin not found",
      },
    },
  })
  getCandlesByIsin(
    @QueryParam("isin") isin: string,
    @QueryParam("sort") sort: SortMode,
    @QueryParam("format") format: boolean
  ): Candle[] | CandleFormatted[] {
    if (!isin) {
      throw new InvalidParametersError("isin");
    }

    let candles = this.candleService.getCandles(isin);

    if (sort === SortMode.ASC) {
      candles = candles.reverse();
    }

    if (format === true) {
      return Utils.formatCandles(candles);
    } else {
      return candles;
    }
  }
}
