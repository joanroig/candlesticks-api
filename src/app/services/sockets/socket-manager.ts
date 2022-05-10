import TypedEmitter from "typed-emitter";
import { Inject, Service } from "typedi";
import configuration from "../../common/constants/configuration";
import Logger from "../../common/logger/logger";
import CandleHistoryDao from "../../dao/candle-history.dao";
import InstrumentDao from "../../dao/instrument.dao";
import { SocketEvent } from "../../models/socket-event.model";
import InstrumentService from "./instrument.service";
import QuoteService from "./quote.service";

const logger = Logger.getLogger("SocketManager");

@Service()
export default class SocketManager {
  @Inject()
  private readonly instrumentService: InstrumentService;

  @Inject()
  private readonly quoteService: QuoteService;

  @Inject()
  protected readonly instrumentDao: InstrumentDao;

  @Inject()
  protected readonly candleHistoryDao: CandleHistoryDao;

  private instrumentEvents: TypedEmitter<SocketEvent>;
  private quoteEvents: TypedEmitter<SocketEvent>;

  private reconnectTime = configuration.SOCKETS_RECONNECT_TIME;

  /**
   * Connect to the instruments first, if success connect to the quotes.
   * If a socket disconnects, all connections are reset and data is cleared.
   */
  connect() {
    this.instrumentEvents = this.instrumentService.connect();

    this.instrumentEvents.on("connected", () => {
      this.quoteEvents = this.quoteService.connect();

      this.quoteEvents.on("disconnected", () => {
        this.disconnected();
      });
    });

    this.instrumentEvents.on("disconnected", () => {
      this.disconnected();
    });
  }

  private disconnected() {
    // Remove event listeners
    this.instrumentEvents?.removeAllListeners();
    this.quoteEvents?.removeAllListeners();

    // Disconnect all sockets
    this.instrumentService.disconnect();
    this.quoteService.disconnect();

    // Clear all data
    this.instrumentDao.clear();
    this.candleHistoryDao.clear();

    // Reconnect after defined time
    logger.info(`Trying to reconnect in ${this.reconnectTime} seconds.`);
    setTimeout(() => {
      this.connect();
    }, this.reconnectTime * 1000);
  }
}
