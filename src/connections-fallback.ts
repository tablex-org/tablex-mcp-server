import { readFile } from "node:fs/promises";
import { redactConnectionURI } from "./format.js";

export type ConnectionSummary = {
  name: string;
  databaseType: string;
  location: string;
};

type SavedConnection = {
  name?: unknown;
  uri?: unknown;
  dbType?: unknown;
};

export async function loadConnectionSummaries(filePath: string): Promise<ConnectionSummary[]> {
  const data = await readFile(filePath, "utf8");
  const raw = JSON.parse(data) as unknown;
  if (!Array.isArray(raw)) return [];

  return raw.flatMap((item: SavedConnection) => {
    if (typeof item.name !== "string" || typeof item.uri !== "string") return [];
    return [{
      name: item.name,
      databaseType: typeof item.dbType === "string" ? item.dbType : inferDatabaseType(item.uri),
      location: redactConnectionURI(item.uri),
    }];
  });
}

function inferDatabaseType(uri: string): string {
  const lower = uri.toLowerCase();
  if (lower.startsWith("postgres://") || lower.startsWith("postgresql://")) return "postgresql";
  if (lower.startsWith("mysql://")) return "mysql";
  if (lower.startsWith("mariadb://")) return "mariadb";
  return "mongodb";
}
