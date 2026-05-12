import type { TunnelRequest, TunnelResponse } from "./types.js";

export type ForwardResult =
  | { ok: true; response: TunnelResponse }
  | { ok: false; error: string };

const BINARY_CONTENT_TYPES = [
  "image/",
  "audio/",
  "video/",
  "application/octet-stream",
  "application/pdf",
];

export async function forwardHttpRequest(
  localBaseUrl: string,
  request: TunnelRequest
): Promise<ForwardResult> {
  const method = request.method || "GET";
  try {
    const init: RequestInit = {
      method,
      headers: {
        ...(request.headers || {}),
      },
    };
    if (request.body !== undefined) {
      init.body = request.body;
    }
    const res = await fetch(`${localBaseUrl}${request.path}`, init);

    const contentType = res.headers.get("content-type") || "";
    const isBinary = BINARY_CONTENT_TYPES.some((type) =>
      contentType.includes(type)
    );

    let body: string;
    if (isBinary) {
      const arrayBuffer = await res.arrayBuffer();
      body = Buffer.from(arrayBuffer).toString("base64");
    } else {
      body = await res.text();
    }

    return {
      ok: true,
      response: {
        id: request.id,
        status: res.status,
        headers: Object.fromEntries(res.headers.entries()),
        body,
        isBinary,
      },
    };
  } catch {
    return {
      ok: false,
      error: "The local service is not running or unreachable.",
    };
  }
}
