import { createServer, Server as AppServer } from "http";
import request from "supertest";
import Container from "typedi";
import { parse } from "url";
import waitForExpect from "wait-for-expect";
import { Server, WebSocket, WebSocketServer } from "ws";
import App from "./app";
import { InstrumentEventType } from "./models/instrument.model";

let appServer: AppServer;

let socketServer: AppServer;

let instrumentsSocket: WebSocket;
let quotesSocket: WebSocket;

let instrumentsServer: Server;
let quotesServer: Server;

const mockInstrumentAdd = {
  data: {
    description: "mel partiendo libris eam causae",
    isin: "OU0I82002178",
  },
  type: InstrumentEventType.ADD,
};

const mockInstrumentDelete = {
  data: {
    description: "mel partiendo libris eam causae",
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

    instrumentsSocket.close();
    quotesSocket.close();

    instrumentsServer.close();
    quotesServer.close();

    socketServer.close();

    Container.reset();
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
      await wait();

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

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await wait();

      // Remove the instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentDelete));
      await wait();

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

  describe("GET /candlesticks", () => {
    it("should return 400 because no isin is provided", async () => {
      // Get candlestick
      await request(appServer)
        .get(`/candlesticks`)
        .expect("Content-Type", /json/)
        .expect(400);
    });

    it("should return 404 because isin does not exist", async () => {
      // Get candlestick
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .expect(404);
    });

    it("should return 404 because the instrument with the isin does not exist", async () => {
      // Add one quote, which will be ignored because there is no instrument with the same isin
      quotesSocket.send(JSON.stringify(mockQuote));
      await wait();

      // Get candlestick
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .expect(404);
    });

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await wait();

      // Get candlestick
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
      await wait();

      // Add one quote, which will add one candle
      quotesSocket.send(JSON.stringify(mockQuote));
      await wait();

      // Get candlestick
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect("Content-Type", /json/)
        .then((res) => {
          expect(res.body).toBeArrayOfSize(1);
        });
    });

    it("should return 200 and an empty array", async () => {
      // Add one instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentAdd));
      await wait();

      // Add one quote, which will add one candle
      quotesSocket.send(JSON.stringify(mockQuote));
      await wait();

      // Remove the instrument
      instrumentsSocket.send(JSON.stringify(mockInstrumentDelete));
      await wait();

      // Get candlestick
      await request(appServer)
        .get(`/candlesticks`)
        .query("isin=OU0I82002178")
        .expect(404);
    });
  });
});

async function wait() {
  return new Promise((resolve) => setTimeout(() => resolve(true), 10));
}
