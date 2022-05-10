import Utils from "../app/common/utils/utils";

export default class TestUtils {
  // Tuesday, May 10, 2022 3:16:00 PM
  static getMockTime() {
    return 1652195760000;
  }

  static getDefaultIsin() {
    return "LJ4043660IX7";
  }

  static mockTimeOnce(time: number) {
    jest.spyOn(Utils, "getCurrentTime").mockReturnValueOnce(time);
  }
}
