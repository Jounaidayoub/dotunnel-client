import { describe, expect, it } from "vitest";
import {
  buildTunnelResponse,
  estimateMessageSize,
  parseIncomingMessage,
} from "../protocol.js";

describe("protocol", () => {
  it("parses valid messages", () => {
    const message = JSON.stringify({ id: "1", path: "/", method: "GET" });
    const parsed = parseIncomingMessage(message);
    expect(parsed.ok).toBe(true);
    if (parsed.ok) {
      expect(parsed.value.id).toBe("1");
    }
  });

  it("rejects invalid messages", () => {
    const parsed = parseIncomingMessage("not json");
    expect(parsed.ok).toBe(false);
  });

  it("builds response payload", () => {
    const payload = buildTunnelResponse({
      id: "1",
      status: 200,
      headers: { "content-type": "text/plain" },
      body: "ok",
      isBinary: false,
    });
    expect(payload).toContain("\"status\":200");
  });

  it("estimates payload size", () => {
    const size = estimateMessageSize("hello");
    expect(size).toBeGreaterThan(0);
  });
});
