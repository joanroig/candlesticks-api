import config from "config";

/**
 * Configuration readed from the config json file.
 * Numbers are checked, default values will be used in case a non-numeric value is provided
 */
export default {
  API_HOST: config.get("api-host"),
  API_PORT: Number(config.get("api-port")) || 9000,
  SOCKETS_URL: config.get("sockets-url"),
  SOCKETS_RECONNECT_TIME: Number(config.get("sockets-reconnect-time")) || 5,
  CANDLESTICK_LIMIT: Number(config.get("candlestick-limit")) || 30,
} as const;
