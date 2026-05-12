import { Command } from "commander";

export type CliOptions = {
  port?: number;
  name?: string;
  baseUrl?: string;
  debug?: boolean;
};

export function parseCliArgs(argv: string[]): CliOptions {
  const program = new Command();
  program
    .name("dotunnel")
    .description("Expose a local HTTP service through a secure tunnel")
    .option("-p, --port <number>", "Local port to expose", (value) => {
      return Number(value);
    })
    .option("-n, --name <proxy>", "Proxy name (subdomain)")
    .option("-b, --base-url <host>", "Base host for the tunnel server")
    .option("-d, --debug", "Enable debug logging")
    .parse(argv);

  const options = program.opts<CliOptions>();
  const result: CliOptions = {};

  if (typeof options.port === "number" && !Number.isNaN(options.port)) {
    result.port = options.port;
  }
  if (options.name) {
    result.name = options.name;
  }
  if (options.baseUrl) {
    result.baseUrl = options.baseUrl;
  }
  if (options.debug) {
    result.debug = true;
  }

  return result;
}
