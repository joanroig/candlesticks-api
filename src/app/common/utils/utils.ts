import { transformAndValidateSync } from "class-transformer-validator";
import moment from "moment";
import {
  Candlestick,
  CandlestickFormatted,
} from "../../models/candlestick.model";

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
    return moment.unix(timestamp / 1000).format("YYYY-MM-DD HH:mm:ss");
  }

  /**
   * Transform a candlestick list to a more readable format, useful for debugging
   * @param candlesticks candlestick list
   * @returns formatted candlestick list
   */
  static formatCandlesticks(candles: Candlestick[]): CandlestickFormatted[] {
    return transformAndValidateSync(
      CandlestickFormatted,
      candles
    ) as CandlestickFormatted[];
  }
}
