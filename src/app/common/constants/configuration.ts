import config from "config";

/**
 * Configuration readed from the config json file.
 * Types are checked, default values will be used in case a wrong value is provided
 */
export default {
  SWAGGER: Boolean(config.get("swagger")) || false,
  CORS: Boolean(config.get("cors")) || true,
  API_HOST: config.get("api-host"),
  API_PORT: Number(config.get("api-port")) || 9000,
  SOCKETS_URL: config.get("sockets-url"),
  SOCKETS_RECONNECT_TIME: Number(config.get("sockets-reconnect-time")) || 5,
  HISTORY_LIMIT: Number(config.get("history-limit")) || 30,
  CLEAN_SCHEDULE: Number(config.get("clean-schedule")) || 10,
} as const;
