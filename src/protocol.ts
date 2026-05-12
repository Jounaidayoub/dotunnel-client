import type { TunnelRequest, TunnelResponse } from "./types.js";

export type ParsedMessage = {
  ok: true;
  value: TunnelRequest;
} | {
  ok: false;
  error: string;
};

export function parseIncomingMessage(data: string): ParsedMessage {
  try {
    const parsed = JSON.parse(data) as TunnelRequest;
    if (!parsed || typeof parsed !== "object") {
      return { ok: false, error: "Invalid message format." };
    }
    if (!parsed.id || !parsed.path) {
      return { ok: false, error: "Missing id or path." };
    }
    return { ok: true, value: parsed };
  } catch {
    return { ok: false, error: "Message is not valid JSON." };
  }
}

export function buildTunnelResponse(response: TunnelResponse): string {
  return JSON.stringify(response);
}

export function estimateMessageSize(payload: string): number {
  return Buffer.byteLength(payload, "utf8");
}

export const MAX_TUNNEL_MESSAGE_BYTES = 1024 * 1024;

export function isOverSizeLimit(bytes: number): boolean {
  return bytes > MAX_TUNNEL_MESSAGE_BYTES;
}
