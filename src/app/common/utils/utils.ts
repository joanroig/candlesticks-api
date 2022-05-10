import { transformAndValidateSync } from "class-transformer-validator";
import moment from "moment";
import { Candle, CandleFormatted } from "../../models/candle.model";

export default class Utils {
  /**
   * Get current time
   * @returns number that represents the current time in milliseconds
   */
  static getCurrentTime(): number {
    return moment.now();
  }

  /**
   * Shift the given timestamp to the start of the minute
   * @param timestamp time in milliseconds
   * @returns number that represents the time at the start of the minute in milliseconds
   */
  static getStartOfMinute(timestamp: number): number {
    return moment(timestamp).startOf("minute").valueOf();
  }

  /**
   * Format the given timestamp to a readable format
   * @param timestamp time in milliseconds
   * @returns string that represents the given time in format YYYY-MM-DD HH:mm:ss
   */
  static formatTime(timestamp: number): string {
    return moment(timestamp).format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * Transform a candle list to a more readable format
   * @param candles candle list
   * @returns formatted candle list
   */
  static formatCandles(candles: Candle[]): CandleFormatted[] {
    return transformAndValidateSync(CandleFormatted, candles);
  }
}
