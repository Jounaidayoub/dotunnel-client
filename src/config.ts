import type { BaseHost, TunnelConfig } from "./types.js";

const DEFAULT_BASE_HOST = "proxy.jounaid.dev";

export function resolveBaseHost(input?: string): BaseHost {
  const host = (input && input.trim().length > 0 ? input.trim() : DEFAULT_BASE_HOST)
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");
  const protocol: BaseHost["protocol"] = host.includes("localhost")
    ? "ws"
    : "wss";
  return { host, protocol };
}

export function createTunnelConfig(params: {
  port: number;
  proxyName: string;
  baseHost: BaseHost;
  debug: boolean;
}): TunnelConfig {
  const localBaseUrl = `http://localhost:${params.port}`;
  const wsUrl = `${params.baseHost.protocol}://${params.baseHost.host}/register/${params.proxyName}`;
  const publicUrl = `https://${params.proxyName}-prxy.${DEFAULT_BASE_HOST.replace("proxy.", "")}`;

  return {
    port: params.port,
    proxyName: params.proxyName,
    baseHost: params.baseHost,
    localBaseUrl,
    wsUrl,
    publicUrl,
    debug: params.debug,
  };
}
