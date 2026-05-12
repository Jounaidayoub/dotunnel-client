import WebSocket from "ws";
import ora from "ora";
import type { Logger } from "./output.ts";
import { formatRequestLog } from "./output.ts";
import type { TunnelConfig } from "./types.ts";
import { parseIncomingMessage, buildTunnelResponse, estimateMessageSize, isOverSizeLimit, MAX_TUNNEL_MESSAGE_BYTES } from "./protocol.ts";
import { forwardHttpRequest } from "./httpForwarding.ts";

type TunnelContext = {
  logger: Logger;
};

export async function startTunnel(config: TunnelConfig, ctx: TunnelContext) {
  const spinner = ora("Connecting to the proxy server...").start();

  const connect = () => {
    const ws = new WebSocket(config.wsUrl, {
      headers: {
        client: "dotunnel-node-cli-client",
      },
    });

    ws.on("unexpected-response", (_req, res) => {
      spinner.fail();
      ctx.logger.error(
        `Connection failed with status ${res.statusCode} ${res.statusMessage}`
      );
      if (res.statusCode === 409) {
        ctx.logger.error("Proxy name is already taken.");
      } else {
        ctx.logger.error("Unable to connect to the server. Please retry later.");
      }
      ws.close();
      process.exit(1);
    });

    ws.on("open", () => {
      spinner.succeed();
      ctx.logger.info("");
      ctx.logger.info(`Forwarding to: ${config.localBaseUrl}`);
      ctx.logger.info(`Public URL:    ${config.publicUrl}`);
      ctx.logger.info("");
    });

    ws.on("message", async (data) => {
      const raw = data.toString();
      ctx.logger.debug("Received message", raw);
      const parsed = parseIncomingMessage(raw);
      if (!parsed.ok) {
        ctx.logger.warn(parsed.error);
        return;
      }

      const request = parsed.value;
      
      //ingore websockets for now !!
      if (request.headers?.connection === "Upgrade") {
        ctx.logger.warn("WebSocket upgrade requests are not supported yet.");
        return;
      }

      const forwarded = await forwardHttpRequest(config.localBaseUrl, request);
      if (!forwarded.ok) {
        ctx.logger.error(forwarded.error);
        ctx.logger.warn(`Make sure your local server is running on ${config.localBaseUrl}`);
        return;
      }

      const payload = buildTunnelResponse(forwarded.response);
      const payloadSize = estimateMessageSize(payload);
      if (isOverSizeLimit(payloadSize)) {
        ctx.logger.debug(
          `Response too large (${payloadSize} bytes). Max is ${MAX_TUNNEL_MESSAGE_BYTES} bytes.`
        );
        ctx.logger.info(
          formatRequestLog({
            status: forwarded.response.status,
            method: request.method || "GET",
            path: request.path,
            note: "too large",
            ...(request.headers?.["x-real-ip"]
              ? { ip: request.headers["x-real-ip"] }
              : {}),
          })
        );
        return;
      }

      ctx.logger.info(
        formatRequestLog({
          status: forwarded.response.status,
          method: request.method || "GET",
          path: request.path,
          ...(request.headers?.["x-real-ip"]
            ? { ip: request.headers["x-real-ip"] }
            : {}),
        })
      );

      ws.send(payload);
      ctx.logger.debug(`Handled request ${request.id}`);
    });

    ws.on("close", (code, reason) => {
      ctx.logger.error("Connection to the server closed.");
      ctx.logger.debug(`Disconnected: ${code} - ${reason.toString()}`);
      if (code === 1009) {
        ctx.logger.error(
          "Message too big. Please reduce the size of your requests."
        );
        ctx.logger.warn("Retrying connection...");
        setTimeout(connect, 1000);
      }
    });

    const shutdown = () => {
      ctx.logger.info("Shutting down.");
      try {
        ws.close(1000, "client-closed");
      } catch {
        // ignore
      }
      setTimeout(() => process.exit(0), 500);
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
  };

  connect();
}
