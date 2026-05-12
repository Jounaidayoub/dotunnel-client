import { afterAll, beforeAll, describe, expect, it } from "vitest";
import http from "node:http";
import { forwardHttpRequest } from "../httpForwarding.js";

let server: http.Server;
let port = 0;

beforeAll(async () => {
  server = http.createServer((req, res) => {
    if (req.url === "/ping") {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("pong");
      return;
    }
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("missing");
  });

  await new Promise<void>((resolve) => {
    server.listen(0, () => {
      const address = server.address();
      if (address && typeof address === "object") {
        port = address.port;
      }
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve();
    });
  });
});

describe("integration", () => {
  it("forwards a request to local server", async () => {
    const result = await forwardHttpRequest(`http://localhost:${port}`, {
      id: "1",
      path: "/ping",
      method: "GET",
      headers: {},
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.response.status).toBe(200);
      expect(result.response.body).toBe("pong");
      expect(result.response.isBinary).toBe(false);
    }
  });
});
