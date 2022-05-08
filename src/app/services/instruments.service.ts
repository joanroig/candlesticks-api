import { transformAndValidateSync } from "class-transformer-validator";
import { Service } from "typedi";
import CandlesticksDao from "../dao/candlesticks.dao";
import InstrumentsDao from "../dao/instruments.dao";
import {
  InstrumentEvent,
  InstrumentEventType,
} from "../models/instrument.model";
import StreamService from "./stream.service";

@Service()
export class InstrumentsService extends StreamService {
  constructor(
    private readonly instrumentsDao: InstrumentsDao,
    private readonly candlesticksDao: CandlesticksDao
  ) {
    super("instruments");
  }

  onMessage(data: string) {
    const instrumentEvent = transformAndValidateSync(InstrumentEvent, data, {
      transformer: { excludeExtraneousValues: true },
    }) as InstrumentEvent;
    const instrument = instrumentEvent.data;

    switch (instrumentEvent.type) {
      case InstrumentEventType.ADD:
        if (this.instrumentsDao.has(instrument.isin)) {
          console.error(`Instrument ${instrument.isin} already exists`);
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
          console.error(`Instrument ${instrument.isin} does not exist`);
        }
        break;

      default:
        console.error("InstrumentEventType not recognized");
        break;
    }
  }
}
