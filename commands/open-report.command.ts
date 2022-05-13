import { exec } from "child_process";
import path from "path";

// Open the coverage report, platform-aware
const url = path.resolve(__dirname, "../performance/report.html");
const start =
  process.platform == "darwin"
    ? "open"
    : process.platform == "win32"
    ? "start"
    : "xdg-open";
exec(`${start} ${url}`);
