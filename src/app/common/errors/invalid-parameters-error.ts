import { CustomError } from "../../models/custom-error.model";

export default class InvalidParametersError extends CustomError {
  constructor(parameterList: string) {
    super(400, `Invalid parameters, please provide: ${parameterList}`);
  }
}
