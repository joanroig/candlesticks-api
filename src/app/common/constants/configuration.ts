import config from "config";

/**
 * Configuration readed from the config json file.
 * Types are checked, default values will be used in case a wrong value is provided.
 */
export default {
  SWAGGER: checkBoolean("swagger", false),
  CORS: checkBoolean("cors", true),
  MORGAN: checkBoolean("morgan", true),
  LOG_LEVEL: checkString("log-level", "info"),
  API_HOST: checkString("api-host", ""),
  API_PORT: checkNumber("api-port", 9000),
  SOCKETS_URL: config.get("sockets-url"),
  SOCKETS_RECONNECT_TIME: checkNumber("sockets-reconnect-time", 5),
  HISTORY_LIMIT: checkNumber("history-limit", 30),
  CLEAN_SCHEDULE: checkNumber("clean-schedule", 10),
  TIMEZONE_OFFSET: checkNumber("timezone-offset", 2),
} as const;

function checkString(id: string, defaultValue: string): string {
  const result = getConfig(id);
  return typeof result === "string" ? result : defaultValue;
}

function checkBoolean(id: string, defaultValue: boolean): boolean {
  const result = getConfig(id);
  return typeof result === "boolean" ? result : defaultValue;
}

function checkNumber(id: string, defaultValue: number): number {
  const result = getConfig(id);
  return typeof result === "number" ? result : defaultValue;
}

function getConfig(id: string) {
  return config.get(id);
}
