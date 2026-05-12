import inquirer from "inquirer";
import {
  isPortOpen,
  validatePortNumber,
  validateProxyName,
  validateProxyNameAvailability,
} from "./validation.ts";

export async function promptForPort(): Promise<number> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "port",
      message: "Enter the local port of the service to expose (e.g., 8000):",
      validate: async (input) => {
        const validation = validatePortNumber(input);
        if (!validation.ok) {
          return validation.error;
        }
        const open = await isPortOpen(validation.value);
        return open || "Port is not open.";
      },
    },
  ]);
  return Number(answers.port);
}

export async function promptForProxyName(baseHost: string): Promise<string> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "proxyName",
      message: "Enter a name for the proxy (e.g., todo):",
      validate: async (input) => {
        const validation = validateProxyName(input);
        if (!validation.ok) {
          return validation.error;
        }
        const availability = await validateProxyNameAvailability(
          baseHost,
          validation.value
        );
        return availability.ok || availability.error;
      },
    },
  ]);

  const validation = validateProxyName(answers.proxyName);
  return validation.ok ? validation.value : answers.proxyName.trim();
}
