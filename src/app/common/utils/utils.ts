import { transformAndValidateSync } from "class-transformer-validator";
import { Candle, CandleFormatted } from "../../models/candle.model";
import configuration from "../constants/configuration";

export default class Utils {
  /**
   * Get current time in UTC
   * @returns number that represents the current time in milliseconds
   */
  static getCurrentTime(): number {
    return Date.now();
  }

  /**
   * Shift the given timestamp to the start of the minute
   * @param timestamp time in milliseconds
   * @returns number that represents the time at the start of the minute in milliseconds
   */
  static getStartOfMinute(timestamp: number): number {
    const now = new Date(timestamp);
    now.setSeconds(0);
    now.setMilliseconds(0);
    return now.getTime();
  }

  /**
   * Format the given timestamp to a readable format in the defined locale and timezone
   * @param timestamp time in milliseconds
   * @returns string that represents the given time in format YYYY-MM-DD HH:mm:ss
   */
  static formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleString(configuration.LOCALE, {
      timeZone: configuration.TIMEZONE,
    });
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
