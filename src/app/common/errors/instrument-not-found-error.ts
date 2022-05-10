import { ISIN } from "../../models/alias.model";
import { CustomError } from "../../models/custom-error.model";

export default class InstrumentNotFoundError extends CustomError {
  constructor(isin: ISIN) {
    super(404, `Instrument with isin ${isin} not found.`);
  }
}
