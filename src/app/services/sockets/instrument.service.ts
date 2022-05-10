import { transformAndValidateSync } from "class-transformer-validator";
import { Inject, Service } from "typedi";
import PartnerEndpoints from "../../common/constants/partner-endpoints";
import Logger from "../../common/logger/logger";
import CandleHistoryDao from "../../dao/candle-history.dao";
import InstrumentDao from "../../dao/instrument.dao";
import { ISIN } from "../../models/alias.model";
import {
  Instrument,
  InstrumentEvent,
  InstrumentEventType,
} from "../../models/instrument.model";
import Socket from "./socket";

const logger = Logger.getLogger("InstrumentService");

@Service()
export default class InstrumentService extends Socket {
  @Inject()
  protected readonly instrumentDao: InstrumentDao;

  @Inject()
  protected readonly candleHistoryDao: CandleHistoryDao;

  constructor() {
    super(PartnerEndpoints.INSTRUMENTS, InstrumentService.name);
  }

  getInstruments(): Instrument[] {
    return this.instrumentDao.getInstruments();
  }

  getIsinList(): ISIN[] {
    return this.instrumentDao.getKeys();
  }

  protected onMessage(data: string) {
    const instrumentEvent = transformAndValidateSync(InstrumentEvent, data, {
      transformer: { excludeExtraneousValues: true },
    }) as InstrumentEvent;
    this.handleInstrument(instrumentEvent);
  }

  /**
   * Process an instrument event, which may add or remove an instrument
   * @param instrumentEvent
   */
  private handleInstrument(instrumentEvent: InstrumentEvent) {
    const instrument = instrumentEvent.data;

    switch (instrumentEvent.type) {
      case InstrumentEventType.ADD:
        if (this.instrumentDao.has(instrument.isin)) {
          logger.error(`Instrument ${instrument.isin} already exists`);
        } else {
          this.instrumentDao.set(instrument.isin, instrument);
        }
        break;

      case InstrumentEventType.DELETE:
        if (this.instrumentDao.has(instrument.isin)) {
          this.instrumentDao.delete(instrument.isin);
          // also delete the candle history with the same isin
          this.candleHistoryDao.delete(instrument.isin);
        } else {
          logger.error(`Instrument ${instrument.isin} does not exist`);
        }
        break;

      default:
        logger.error("InstrumentEventType not recognized");
        break;
    }
  }
}
