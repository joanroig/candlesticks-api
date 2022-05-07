import config from "config";
import express from "express";
import instrumentStreamService from "./app/services/instrument-stream.service";
import quoteStreamService from "./app/services/quote-stream.service";

const app = express();

app.get("/candlesticks", (req, res) => {
  res.send("isin: " + req.query.isin);
});

// Listen to the specified port, or 9000 otherwise
const PORT = config.get("api-port") || 9000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

// Connect streams
instrumentStreamService.connect();
quoteStreamService.connect();

// TODO: check reconnection
