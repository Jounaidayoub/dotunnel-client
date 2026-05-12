import { parseCliArgs } from "./cli.ts";
import { createTunnelConfig, resolveBaseHost } from "./config.ts";
import { promptForPort, promptForProxyName } from "./prompts.ts";
import { createLogger, showIntro } from "./output.ts";
import { startTunnel } from "./tunnel.ts";
import {
  validatePortNumber,
  validateProxyName,
  validateProxyNameAvailability,
} from "./validation.ts";

async function resolveInputs() {
  const cli = parseCliArgs(process.argv);
  const baseHostInput = cli.baseUrl || process.env.DOTUNNEL_BASE_URL;
  const baseHost = resolveBaseHost(baseHostInput);
  const debug = cli.debug || process.env.DEBUG === "true";
  const logger = createLogger({ debug });

  let port = cli.port;
  if (port !== undefined) {
    const portValidation = validatePortNumber(port);
    if (!portValidation.ok) {
      logger.error(portValidation.error);
      process.exit(1);
    }
    port = portValidation.value;
  } else {
    port = await promptForPort();
  }

  let proxyName = cli.name;
  if (proxyName !== undefined) {
    const proxyValidation = validateProxyName(proxyName);
    if (!proxyValidation.ok) {
      logger.error(proxyValidation.error);
      process.exit(1);
    }
    const availability = await validateProxyNameAvailability(
      baseHost.host,
      proxyValidation.value
    );
    if (!availability.ok) {
      logger.error(availability.error);
      process.exit(1);
    }
    proxyName = proxyValidation.value;
  } else {
    proxyName = await promptForProxyName(baseHost.host);
  }

  return { port, proxyName, baseHost, debug, logger };
}

async function main() {
  const { port, proxyName, baseHost, debug, logger } = await resolveInputs();
  showIntro(logger);
  const config = createTunnelConfig({
    port,
    proxyName,
    baseHost,
    debug,
  });

  await startTunnel(config, { logger });
}

main().catch((err) => {
  if (err?.name === "ExitPromptError") {
    console.log("Prompt cancelled by user.");
    process.exit(0);
  }
  console.error("Unexpected error.", err);
  process.exit(1);
});
