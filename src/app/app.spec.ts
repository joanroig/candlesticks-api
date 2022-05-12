import { createServer, Server as AppServer } from "http";
import request from "supertest";
import Container from "typedi";
import { parse } from "url";
import waitForExpect from "wait-for-expect";
import { Server, WebSocket, WebSocketServer } from "ws";
import TestUtils from "../test/test-utils";
import App from "./app";
import configuration from "./common/constants/configuration";
import { InstrumentEventType } from "./models/instrument.model";

let appServer: AppServer;

let socketServer: AppServer;

let instrumentsSocket: WebSocket;
let quotesSocket: WebSocket;

let instrumentsServer: Server;
let quotesServer: Server;

const mockInstrumentAdd = {
  data: {
    description: "mock instrument add 1",
    isin: "OU0I82002178",
  },
  type: InstrumentEventType.ADD,
};

const mockInstrumentDelete = {
  data: {
    description: "mock instrument delete",
    isin: "OU0I82002178",
  },
  type: InstrumentEventType.DELETE,
};

const mockQuote = {
  data: {
    price: 367.3409,
    isin: "OU0I82002178",
  },
  type: "QUOTE",
};

describe("API Tests", () => {
  beforeEach(async () => {
    let instrumentsConnected = false;
    let quotesConnected = false;

    socketServer = createServer();

    // Setup instruments web socket server to mock a stream of instruments
    instrumentsServer = new WebSocketServer({
      noServer: true,
    });
    instrumentsServer.on("connection", function connection(ws) {
      instrumentsSocket = ws;
      instrumentsConnected = true;
    });

    // Setup quotes web socket server to mock a stream of quotes
    quotesServer = new WebSocketServer({
      noServer: true,
    });
    quotesServer.on("connection", function connection(ws) {
      quotesSocket = ws;
      quotesConnected = true;
    });

    // Route connections to the respective socket
    socketServer.on("upgrade", function upgrade(req, socket, head) {
      const { pathname } = parse(req.url);
      if (pathname === "/instruments") {
        instrumentsServer.handleUpgrade(req, socket, head, function done(ws) {
          instrumentsServer.emit("connection", ws, req);
        });
      } else if (pathname === "/quotes") {
        quotesServer.handleUpgrade(req, socket, head, function done(ws) {
          quotesServer.emit("connection", ws, req);
        });
      } else {
        socket.destroy();
      }
    });

    // Start sockets server
    socketServer.listen(8032);

    // Start app
    appServer = Container.get(App).start();

    // Wait for the app to connect with the sockets
    await waitForExpect(() => {
      expect(instrumentsConnected).toEqual(true);
    });
    await waitForExpect(() => {
      expect(quotesConnected).toEqual(true);
    });
  });

  afterEach(() => {
    // Close app, socket server and sockets
    Container.get(App).stop();

    instrumentsSocket.terminate();
    quotesSocket.terminate();

    instrumentsServer.close();
    quotesServer.close();

    socketServer.close();

    Container.reset();
  });

  describe("Socket connections", () => {
    it("should reconnect the sockets", async () => {
      // Check if sockets are connected
      expect(instrumentsServer.clients.size).toBe(1);
      expect(quotesServer.clients.size).toBe(1);

      // Close the quotes socket of the socket server
      quotesSocket.terminate();

      // Both sockets should disconnect
      await waitForExpect(() => {
        expect(instrumentsServer.clients.size).toEqual(0);
        expect(quotesServer.clients.size).toEqual(0);
      });

      // Check if sockets are reconnected after the reconnection time
      await waitForExpect(() => {
        expect(instrumentsServer.clients.size).toEqual(1);
        expect(quotesServer.clients.size).toEqual(1);
      });

      // Close the instruments socket of the socket server
      instrumentsSocket.terminate();

      // Both sockets should disconnect
      await waitForExpect(() => {
        expect(instrumentsServer.clients.size).toEqual(0);
        expect(quotesServer.clients.size).toEqual(0);
      });

      // Check if sockets are reconnected after the reconnection time
      await waitForExpect(() => {
        expect(instrumentsServer.clients.size).toEqual(1);
        expect(quotesServer.clients.size).toEqual(1);
      });
    });
  });

  describe("GET /instruments/count", () => {
    it("should return the number of instruments", async () => {
      // Get count
      await request(appServer)
        .get(`/instruments/count`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body.count).toBe(0);
        });

      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Get count
      await request(appServer)
        .get(`/instruments/count`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body.count).toBe(1);
        });
    });
  });

  describe("GET /instruments", () => {
    it("should return 200 and an empty array", async () => {
      // Get all instruments
      await request(appServer)
        .get(`/instruments`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(0);
        });
    });

    it("should return 200 and one result", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Get all instruments
      await request(appServer)
        .get(`/instruments`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toMatchObject([mockInstrumentAdd.data]);
        });

      // Get only isins
      await request(appServer)
        .get(`/instruments`)
        .query("isinonly=true")
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toStrictEqual([mockInstrumentAdd.data.isin]);
        });
    });

    it("should return 200 and one result which is overwritten", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Overwrite instrument
      const mockOverwriteInstrumentAdd = {
        data: {
          description: "overwritten",
          isin: mockInstrumentAdd.data.isin,
        },
        type: InstrumentEventType.ADD,
      };
      instrumentsSocket.send(JSON.stringify(mockOverwriteInstrumentAdd));
      await TestUtils.wait();

      // Get all instruments
      await request(appServer)
        .get(`/instruments`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toMatchObject([mockOverwriteInstrumentAdd.data]);
        });
    });

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Remove the instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentDelete));
      await TestUtils.wait();

      // Get all instruments
      await request(appServer)
        .get(`/instruments`)
        .expect("Content-Type", /json/)
        .expect(200)
        .then((res) => {
          expect(res.body).toMatchObject([]);
        });
    });
  });

  describe("GET /candlesticks/count", () => {
    it("should return the number of candles", async () => {
      // Get count
      await request(appServer)
        .get(`/candlesticks/count`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body.count).toBe(0);
        });

      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Add one quote, which will add one candle
      quotesSocket.send(JSON.stringify(mockQuote));
      await TestUtils.wait();

      // Get count
      await request(appServer)
        .get(`/candlesticks/count`)
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body.count).toBe(1);
        });
    });
  });

  describe("GET /candlesticks", () => {
    it("should return 400 because no isin is provided", async () => {
      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .expect("Content-Type", /json/)
        .expect(400);
    });

    it("should return 404 because isin does not exist", async () => {
      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .expect(404);
    });

    it("should return 404 because the instrument with the isin does not exist", async () => {
      // Add one quote, which will be ignored because there is no instrument with the same isin
      quotesSocket.send(JSON.stringify(mockQuote));
      await TestUtils.wait();

      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .expect(404);
    });

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toMatchObject([]);
        });
    });

    it("should return 200 and one result", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Add one quote, which will add one candle
      quotesSocket.send(JSON.stringify(mockQuote));
      await TestUtils.wait();

      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(1);
          expect(res.body[0].openTimestamp).toBeNumber();
          expect(res.body[0].closeTimestamp).toBeNumber();
          expect(res.body[0].openPrice).toBeNumber();
          expect(res.body[0].closePrice).toBeNumber();
          expect(res.body[0].highPrice).toBeNumber();
          expect(res.body[0].lowPrice).toBeNumber();
        });

      // Get formatted candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .query("format=true")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(1);
          expect(res.body[0].openTimestamp).toBeString();
          expect(res.body[0].closeTimestamp).toBeString();
          expect(res.body[0].openPrice).toBeNumber();
          expect(res.body[0].closePrice).toBeNumber();
          expect(res.body[0].highPrice).toBeNumber();
          expect(res.body[0].lowPrice).toBeNumber();
        });
    });

    it("should return 200 and result depending on the query", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Add one quote, which will add one candle
      TestUtils.mockTime(TestUtils.getMockTime());
      quotesSocket.send(JSON.stringify(mockQuote));
      await TestUtils.wait();

      // Pass one minute, so a clone will be generated
      TestUtils.mockTime(TestUtils.getMockTimeAfter1Minute());

      // Get candles ascending
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(2);
          expect(res.body[0].openTimestamp).toBe(TestUtils.getMockTime());
          expect(res.body[0].closeTimestamp).toBe(TestUtils.getMockTime());
          expect(res.body[1].openTimestamp).toBe(
            TestUtils.getMockTimeAfter1Minute()
          );
          expect(res.body[1].closeTimestamp).toBe(
            TestUtils.getMockTimeAfter1Minute()
          );
        });

      // Get candles descending
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .query("sort=desc")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(2);
          expect(res.body[0].openTimestamp).toBe(
            TestUtils.getMockTimeAfter1Minute()
          );
          expect(res.body[0].closeTimestamp).toBe(
            TestUtils.getMockTimeAfter1Minute()
          );
          expect(res.body[1].openTimestamp).toBe(TestUtils.getMockTime());
          expect(res.body[1].closeTimestamp).toBe(TestUtils.getMockTime());
        });
    });

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await TestUtils.wait();

      // Add one quote, which will add one candle
      quotesSocket.send(JSON.stringify(mockQuote));
      await TestUtils.wait();

      // Remove the instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentDelete));
      await TestUtils.wait();

      // Get candle
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect(404);
    });
  });

  describe("GET /docs/", () => {
    it("should return 200 ", async () => {
      // Check if swagger is down
      await request(appServer).get(`/docs/`).expect(404);

      // Set the swagger configuration to true
      // Note: To clear a defineProperty the Container needs to be reset (see afterEach)
      Object.defineProperty(configuration, "SWAGGER", {
        value: true,
      });

      // Restart app to force reading the configuration again
      Container.get(App).stop();
      Container.reset();
      await TestUtils.wait();
      appServer = Container.get(App).start();
      await TestUtils.wait();

      // Check if swagger is up
      await request(appServer).get(`/docs/`).expect(200);
    });
  });
});
