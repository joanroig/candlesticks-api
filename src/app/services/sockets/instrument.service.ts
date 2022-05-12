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

/**
 * Service that handles instrument data received from the partner
 */
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

  countInstruments(): number {
    return this.instrumentDao.countAllInstruments();
  }

  protected onMessage(data: string) {
    // const instrumentEvent = transformAndValidateSync(InstrumentEvent, data, {
    //   transformer: { excludeExtraneousValues: true },
    // }) as InstrumentEvent;
    const instrumentEvent: InstrumentEvent = JSON.parse(data);
    if (instrumentEvent.data?.isin) {
      this.handleInstrument(instrumentEvent);
    } else {
      throw new Error("Instrument parsing problem");
    }
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
          logger.warn(
            `Instrument ${instrument.isin} already exists, overwriting.`
          );
        }
        this.instrumentDao.set(instrument.isin, instrument);
        this.candleHistoryDao.initialize(instrument.isin);
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
