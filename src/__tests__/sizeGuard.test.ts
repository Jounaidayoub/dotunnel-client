import { describe, expect, it } from "vitest";
import { isOverSizeLimit, MAX_TUNNEL_MESSAGE_BYTES } from "../protocol.js";

describe("size guard", () => {
  it("allows sizes under limit", () => {
    expect(isOverSizeLimit(MAX_TUNNEL_MESSAGE_BYTES - 1)).toBe(false);
  });

  it("rejects sizes over limit", () => {
    expect(isOverSizeLimit(MAX_TUNNEL_MESSAGE_BYTES + 1)).toBe(true);
  });
});
