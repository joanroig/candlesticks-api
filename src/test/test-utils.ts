import Utils from "../app/common/utils/utils";

export default class TestUtils {
  // Tuesday, May 10, 2022 3:15:00 PM
  static getMockTime() {
    return 1652195700000;
  }
  // Tuesday, May 10, 2022 3:16:00 PM
  static getMockTimeAfter1Minute() {
    return 1652195760000;
  }

  static getDefaultIsin1() {
    return "LJ4043660IX7";
  }
  static getDefaultIsin2() {
    return "EP999000000";
  }

  static mockTime(time: number) {
    jest.spyOn(Utils, "getCurrentTime").mockReturnValue(time);
  }

  static wait(miliseconds = 10) {
    return new Promise((resolve) =>
      setTimeout(() => resolve(true), miliseconds)
    );
  }
}
