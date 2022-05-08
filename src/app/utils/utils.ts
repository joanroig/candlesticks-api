import moment from "moment";

export default class Utils {
  /**
   * Get current time
   * @returns number that represents the current time in milliseconds
   */
  static getCurrentTime(): number {
    return moment.now();
  }

  /**
   * Format the given timestamp to a readable format
   * @param timestamp time in milliseconds
   * @returns string that represents the given time in format YYYY-MM-DD HH:mm:ss
   */
  static formatTime(timestamp: number): string {
    return moment.unix(timestamp / 1000).format("YYYY-MM-DD HH:mm:ss");
  }
}
