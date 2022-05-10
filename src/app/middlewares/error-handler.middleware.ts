import {
  ExpressErrorMiddlewareInterface,
  Middleware,
} from "routing-controllers";
import { Service } from "typedi";

/**
 * Middleware that takes care of returning proper errors to the caller
 */
@Service()
@Middleware({ type: "after" })
export default class ErrorHandler implements ExpressErrorMiddlewareInterface {
  error(error: any, request: any, response: any, next: (err: any) => any) {
    const status = error.status || 500;
    const message = error.message || "Something went wrong";
    response.status(status).send({
      status,
      message,
    });
  }
}
