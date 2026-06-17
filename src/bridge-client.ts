import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

export type BridgeConnectionSummary = {
  id: string;
  name: string;
  databaseType: string;
  location: string;
};

type BridgeEnvelope<T> = {
  ok: boolean;
  data?: T;
  error?: string;
};

export class TableXBridgeClient {
  constructor(private readonly baseDirectories = defaultBridgeDirectories()) {}

  async health(): Promise<string> {
    const data = await this.request<{ status: string }>("/health");
    return data.status;
  }

  async connections(): Promise<BridgeConnectionSummary[]> {
    return this.request<BridgeConnectionSummary[]>("/connections");
  }

  private async request<T>(path: string): Promise<T> {
    const [port, token] = await this.readBridgeFiles();
    const url = `http://127.0.0.1:${port.trim()}${path}`;
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token.trim()}` },
    });
    if (!response.ok) {
      throw new Error(`tablex bridge HTTP ${response.status}`);
    }
    const envelope = (await response.json()) as BridgeEnvelope<T>;
    if (!envelope.ok || envelope.data === undefined) {
      throw new Error(envelope.error || "tablex bridge request failed");
    }
    return envelope.data;
  }

  private async readBridgeFiles(): Promise<[string, string]> {
    let lastError: unknown;
    for (const directory of this.baseDirectories) {
      try {
        return await Promise.all([
          readFile(join(directory, "mcp-bridge-port"), "utf8"),
          readFile(join(directory, "mcp-bridge-token"), "utf8"),
        ]);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("tablex bridge files not found");
  }
}

function defaultBridgeDirectories(): string[] {
  const appSupport = join(homedir(), "Library", "Application Support");
  return [
    join(appSupport, "tablex"),
    join(appSupport, "TableLeaf"),
    join(appSupport, "DBClient"),
  ];
}
