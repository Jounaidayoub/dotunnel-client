import chalk from "chalk";

export type Logger = {
  info: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
  debug: (message: string, meta?: unknown) => void;
};

export function createLogger(options: { debug: boolean }): Logger {
  return {
    info: (message) => console.log(message),
    warn: (message) => console.warn(chalk.yellow(message)),
    error: (message) => console.error(chalk.red(message)),
    debug: (message, meta) => {
      if (options.debug) {
        if (meta === undefined) {
          console.log(chalk.gray(`[debug] ${message}`));
        } else {
          console.log(chalk.gray(`[debug] ${message}`), meta);
        }
      }
    },
  };
}

export function showIntro(logger: Logger) {
  logger.info("");
  logger.info(
    chalk.bold(
      "Expose your localhost to the world without firewall or port forwarding."
    )
  );
  logger.info("");
  logger.info(chalk.cyan("dotunnel client"));
  logger.info("");
  logger.info(chalk.gray("Example: http://localhost:8000 -> https://todo-prxy.ayooub.me"));
  logger.info("");
}

export function formatRequestLog(params: {
  ip?: string;
  status: number;
  method: string;
  path: string;
  note?: string;
}) {
  const statusColor = getStatusColor(params.status);
  const statusText = chalk[statusColor](String(params.status));
  const ipPart = params.ip ? `[${params.ip}] ` : "";
  const note = params.note ? ` ${chalk.red(params.note)}` : "";
  return `${ipPart}${statusText} ${params.method} > ${params.path}${note}`;
}

function getStatusColor(status: number): "green" | "yellow" | "red" | "gray" {
  if (status >= 500) return "red";
  if (status >= 400) return "yellow";
  if (status >= 300) return "gray";
  if (status >= 200) return "green";
  return "gray";
}
