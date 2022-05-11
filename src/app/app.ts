import { validationMetadatasToSchemas } from "class-validator-jsonschema";
import { Application } from "express";
import { Server } from "http";
import morgan from "morgan";
import "reflect-metadata";
import {
  createExpressServer,
  getMetadataArgsStorage,
  RoutingControllersOptions,
  useContainer,
} from "routing-controllers";
import { routingControllersToSpec } from "routing-controllers-openapi";
import * as swaggerUiExpress from "swagger-ui-express";
import Container, { Inject, Service } from "typedi";
import configuration from "./common/constants/configuration";
import Endpoints from "./common/constants/endpoints";
import Logger from "./common/logger/logger";
import CandleController from "./controllers/candle.controller";
import InstrumentController from "./controllers/instrument.controller";
import ErrorHandler from "./middlewares/error-handler.middleware";
import SocketManager from "./services/sockets/socket-manager";

const logger = Logger.getLogger("App");

/**
 * App class that bootstraps the server
 */
@Service()
export default class App {
  // Listen to the specified port, use 9000 if not defined
  private readonly HOST = configuration.API_HOST;
  private readonly PORT = configuration.API_PORT;

  @Inject()
  private readonly socketsManager: SocketManager;

  private app: Application;
  private server: Server;

  start() {
    this.socketsManager.connect();
    this.server = this.initializeServer();
    return this.server;
  }

  stop() {
    this.socketsManager.disconnect();
    this.server.close();
  }

  private initializeServer(): Server {
    // Allow DI in controllers, this needs to be done before any operation of routing-controllers
    useContainer(Container);

    // Set server configuration
    const routingControllersOptions: RoutingControllersOptions = {
      controllers: [InstrumentController, CandleController],
      defaultErrorHandler: false,
      middlewares: [ErrorHandler],
      cors: configuration.CORS,
    };

    this.app = createExpressServer(routingControllersOptions);

    // Print API calls
    if (configuration.MORGAN) {
      this.app.use(morgan("tiny"));
    }

    // Setup Swagger for development purposes
    if (configuration.SWAGGER) {
      this.setupSwagger(routingControllersOptions);
    }

    const server = this.app.listen(this.PORT, () => {
      // Print API information
      logger.info(`Environment: ${process.env.NODE_ENV || "default"}`);
      logger.info(`Server listening on ${this.HOST}:${this.PORT}`);
      logger.info("Exposed endpoints:");
      for (const entry of Object.values(Endpoints)) {
        logger.info(` - ${this.HOST}:${this.PORT}/${entry}`);
      }
      if (configuration.SWAGGER) {
        logger.info("Swagger specification:");
        logger.info(` - ${this.HOST}:${this.PORT}/docs`);
      }
    });

    // Respond to 'Ctrl+C'
    process.on("SIGINT", () => {
      this.safeShutdown(server);
    });
    // Server is shutting down
    process.on("SIGTERM", () => {
      this.safeShutdown(server);
    });

    return server;
  }

  private safeShutdown(server: Server) {
    server.close(function () {
      process.exit(0);
    });
  }

  private setupSwagger(routingControllersOptions: RoutingControllersOptions) {
    // Parse class-validator classes into JSON Schema:
    const schemas = validationMetadatasToSchemas();

    // Parse routing-controllers classes into OpenAPI spec:
    const storage = getMetadataArgsStorage();
    const spec = routingControllersToSpec(storage, routingControllersOptions, {
      components: {
        schemas,
        securitySchemes: {
          basicAuth: {
            scheme: "basic",
            type: "http",
          },
        },
      },
      info: {
        description: "REST API for getting candlesticks updates.",
        title: "Candlesticks API",
        version: "1.0.0",
      },
    });

    this.app.use("/docs", swaggerUiExpress.serve, swaggerUiExpress.setup(spec));
  }
}
