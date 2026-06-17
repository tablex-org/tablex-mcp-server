import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { loadConnectionSummaries } from "../src/connections-fallback.js";

test("loadConnectionSummaries parses tablex connections and redacts URI", async () => {
  const dir = await mkdtemp(join(tmpdir(), "tablex-mcp-"));
  const file = join(dir, "connections.json");
  await writeFile(file, JSON.stringify([
    {
      id: "00000000-0000-0000-0000-000000000001",
      name: "prod",
      uri: "postgresql://user:secret@example.com:5432/app",
      dbType: "postgresql",
      colorHex: "#888888",
      createdAt: "2026-01-01T00:00:00Z"
    }
  ]));

  const connections = await loadConnectionSummaries(file);

  assert.equal(connections.length, 1);
  assert.equal(connections[0].name, "prod");
  assert.equal(connections[0].databaseType, "postgresql");
  assert.equal(connections[0].location, "example.com:5432/app");
});
