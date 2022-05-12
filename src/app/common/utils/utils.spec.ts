import { Candle } from "../../models/candle.model";
import Utils from "./utils";

describe("Utils Tests", () => {
  it("should test time utils", () => {
    expect(Utils.getCurrentTime()).toBeNumber();

    expect(Utils.getStartOfMinute(1652195703413)).toBe(1652195700000);
    expect(Utils.getStartOfMinute(1652044323409)).toBe(1652044320000);

    expect(Utils.formatTime(1652195703413)).toBe("10.5.2022, 17:15:03");
    expect(Utils.formatTime(1652044323409)).toBe("8.5.2022, 23:12:03");

    expect(Utils.formatTime(Utils.getStartOfMinute(1652195703413))).toBe(
      "10.5.2022, 17:15:00"
    );
    expect(Utils.formatTime(Utils.getStartOfMinute(1652044323409))).toBe(
      "8.5.2022, 23:12:00"
    );
  });

  it("should test candle transformation", () => {
    expect(Utils.formatCandles([])).toBeArrayOfSize(0);

    const formatted = Utils.formatCandles([
      new Candle(1652195703413, 1652195723999, 10, 20, 30, 1),
    ]);

    expect(formatted).toBeArrayOfSize(1);
    expect(formatted[0].openTimestamp).toBe("10.5.2022, 17:15:03");
    expect(formatted[0].closeTimestamp).toBe("10.5.2022, 17:15:23");
    expect(formatted[0].openPrice).toBe(10);
    expect(formatted[0].closePrice).toBe(20);
    expect(formatted[0].highPrice).toBe(30);
    expect(formatted[0].lowPrice).toBe(1);
  });
});
