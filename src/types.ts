export type BaseHost = {
  host: string;
  protocol: "ws" | "wss";
};

export type TunnelConfig = {
  port: number;
  proxyName: string;
  baseHost: BaseHost;
  localBaseUrl: string;
  wsUrl: string;
  publicUrl: string;
  debug: boolean;
};

export type TunnelRequest = {
  id: string;
  path: string;
  method?: string;
  headers?: Record<string, string>;
  body?: string;
};

export type TunnelResponse = {
  id: string;
  status: number;
  headers: Record<string, string>;
  body: string;
  isBinary: boolean;
};
