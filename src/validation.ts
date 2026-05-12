const MAX_PROXY_LENGTH = 63;
const SUBDOMAIN_REGEX = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export function validatePortNumber(value: string | number): ValidationResult<number> {
  const port = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(port) || Number.isNaN(port)) {
    return { ok: false, error: "Port must be a number." };
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    return { ok: false, error: "Port must be an integer between 1 and 65535." };
  }
  return { ok: true, value: port };
}

export function validateProxyName(input: string): ValidationResult<string> {
  if (!input || input.trim().length === 0) {
    return { ok: false, error: "Proxy name cannot be empty." };
  }

  const normalized = input.toLowerCase();
  if (normalized.length > MAX_PROXY_LENGTH) {
    return { ok: false, error: "Proxy name must be 63 characters or fewer." };
  }

  if (!SUBDOMAIN_REGEX.test(normalized)) {
    return {
      ok: false,
      error:
        "Proxy name must be a valid subdomain (letters, numbers, hyphens, no leading/trailing hyphens).",
    };
  }

  return { ok: true, value: normalized };
}

type AvailabilityResponse = {
  available?: boolean;
};

export async function isProxyAvailable(
  baseHost: string,
  proxyName: string
): Promise<ValidationResult<boolean>> {
  try {
    const res = await fetch(`http://${baseHost}/is-available/${proxyName}`, {
      method: "GET",
      headers: {
        client: "dotunnel-node-cli-client",
      },
    });
    const data = (await res.json()) as AvailabilityResponse;
    return { ok: true, value: Boolean(data.available) };
  } catch {
    return { ok: false, error: "Failed to check proxy availability." };
  }
}

export async function isPortOpen(port: number): Promise<boolean> {
  try {
    await fetch(`http://localhost:${port}`, {
      headers: {
        connection: "Close",
      },
    });
    return true;
  } catch {
    return false;
  }
}

export async function validateProxyNameAvailability(
  baseHost: string,
  name: string
): Promise<ValidationResult<string>> {
  const available = await isProxyAvailable(baseHost, name);
  if (!available.ok) {
    return available;
  }
  if (!available.value) {
    return { ok: false, error: "Proxy name is already taken." };
  }
  return { ok: true, value: name };
}
