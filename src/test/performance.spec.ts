import { createServer, Server as AppServer } from "http";
import { performance } from "perf_hooks";
import request from "supertest";
import Container from "typedi";
import { parse } from "url";
import waitForExpect from "wait-for-expect";
import { Server, WebSocket, WebSocketServer } from "ws";
import App from "../app/app";
import TestUtils from "./test-utils";

let appServer: AppServer;

let socketServer: AppServer;

let instrumentsSocket: WebSocket;
let quotesSocket: WebSocket;

let instrumentsServer: Server;
let quotesServer: Server;

/**
 * Performance tests
 *
 * @group performance
 */
describe("Performance tests", () => {
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

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(50000);
    console.info(
      `50k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(80000);
    console.info(
      `80k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(100000);
    console.info(
      `100k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(120000);
    console.info(
      `120k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(150000);
    console.info(
      `150K: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(200000);
    console.info(
      `200k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(250000);
    console.info(
      `250k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  it("should check how many operations can handle per second", async () => {
    const result = await runPerfTest(300000);
    console.info(
      `300k: ${result.instrumentsCount} instruments, ${result.candlesCount} candles`
    );
  });

  async function runPerfTest(ops: number) {
    let instrumentsCount = 0;
    let candlesCount = 0;

    // Add instruments and calculate time spent
    let startTime = performance.now();
    for (let i = 0; i < ops; i++) {
      const instrument = `{"data":{"description":"mock","isin":"A${i}"},"type":"ADD"}`;
      instrumentsSocket.send(instrument);
    }
    let elapsed = performance.now() - startTime;

    // Wait one second from the first instrument that was sent
    await TestUtils.wait(1000 - elapsed);

    // Get all instruments
    await request(appServer)
      .get(`/instruments/count`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        instrumentsCount = res.body.count;
      });

    // Wait until all instruments are processed
    let ready = true;
    while (ready) {
      await TestUtils.wait(500);
      await request(appServer)
        .get(`/instruments/count`)
        .then((res) => {
          if (ops === res.body.count) {
            ready = false;
          }
        });
    }

    // Add quotes and calculate time spent
    startTime = performance.now();
    for (let i = 0; i < ops; i++) {
      const quote = `{"data":{"price":367.3409,"isin":"A${i}"},"type":"QUOTE"}`;
      quotesSocket.send(quote);
    }
    elapsed = performance.now() - startTime;

    // Wait one second from the first quote that was sent
    await TestUtils.wait(1000 - elapsed);

    // Get all candles
    await request(appServer)
      .get(`/candlesticks/count`)
      .expect("Content-Type", /json/)
      .expect(200)
      .then((res) => {
        candlesCount = res.body.count;
      });

    return { instrumentsCount, candlesCount };
  }
});
