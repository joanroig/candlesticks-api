// HelloWorldController.ts
import { Controller, Get, QueryParam } from "routing-controllers";
import { Inject, Service } from "typedi";
import Endpoints from "../common/constants/endpoints";
import { ISIN } from "../models/alias.model";
import { Instrument } from "../models/instrument.model";
import InstrumentService from "../services/sockets/instrument.service";

@Service()
@Controller(`/${Endpoints.INSTRUMENTS}`)
export default class InstrumentController {
  @Inject()
  private readonly instrumentService: InstrumentService;

  @Get("/")
  getInstruments(
    @QueryParam("isinonly") isinOnly: boolean
  ): Instrument[] | ISIN[] {
    if (isinOnly) {
      return this.instrumentService.getIsinList();
    } else {
      return this.instrumentService.getInstruments();
    }
  }

  @Get("/count")
  count(): { count: number } {
    {
      return { count: this.instrumentService.countInstruments() };
    }
  }
}
