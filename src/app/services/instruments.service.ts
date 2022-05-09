import { transformAndValidateSync } from "class-transformer-validator";
import { Inject, Service } from "typedi";
import { Logger } from "../common/logger/logger";
import CandlesticksDao from "../dao/candlesticks.dao";
import InstrumentsDao from "../dao/instruments.dao";
import { ISIN } from "../models/aliases.model";
import {
  InstrumentEvent,
  InstrumentEventType,
} from "../models/instrument.model";
import StreamService from "./stream.service";

const logger = Logger.getLogger("InstrumentsService");

@Service()
export default class InstrumentsService extends StreamService {
  @Inject()
  private readonly instrumentsDao: InstrumentsDao;

  @Inject()
  private readonly candlesticksDao: CandlesticksDao;

  constructor() {
    super("instruments", InstrumentsService.name);
  }

  onMessage(data: string) {
    const instrumentEvent = transformAndValidateSync(InstrumentEvent, data, {
      transformer: { excludeExtraneousValues: true },
    }) as InstrumentEvent;
    this.handleInstrument(instrumentEvent);
  }

  handleInstrument(instrumentEvent: InstrumentEvent) {
    const instrument = instrumentEvent.data;

    switch (instrumentEvent.type) {
      case InstrumentEventType.ADD:
        if (this.instrumentsDao.has(instrument.isin)) {
          logger.error(`Instrument ${instrument.isin} already exists`);
        } else {
          this.instrumentsDao.set(instrument.isin, instrument);
        }
        break;

      case InstrumentEventType.DELETE:
        if (this.instrumentsDao.has(instrument.isin)) {
          this.instrumentsDao.delete(instrument.isin);
          // delete the candlesticks with the same isin
          this.candlesticksDao.delete(instrument.isin);
        } else {
          logger.error(`Instrument ${instrument.isin} does not exist`);
        }
        break;

      default:
        logger.error("InstrumentEventType not recognized");
        break;
    }
  }

  getIsinList(): ISIN[] {
    return this.instrumentsDao.getKeys();
  }
}
