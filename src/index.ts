#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { TableXBridgeClient } from "./bridge-client.js";
import { mdTable } from "./format.js";

const server = new McpServer({
  name: "tablex-mcp-server",
  version: "0.1.0",
});

const bridge = new TableXBridgeClient();

server.registerTool(
  "tablex_ping",
  {
    title: "Ping tablex",
    description: "Check whether the tablex local MCP bridge is reachable.",
  },
  async () => {
    const status = await bridge.health();
    return {
      content: [{ type: "text", text: `tablex bridge: ${status}` }],
    };
  },
);

server.registerTool(
  "tablex_list_connections",
  {
    title: "List tablex Connections",
    description: "List saved tablex connections without exposing credentials.",
  },
  async () => {
    const connections = await bridge.connections();
    const text = connections.length === 0
      ? "No saved tablex connections."
      : mdTable(
          ["Name", "Type", "Location"],
          connections.map((connection) => [
            connection.name,
            connection.databaseType,
            connection.location,
          ]),
        );
    return { content: [{ type: "text", text }] };
  },
);

await server.connect(new StdioServerTransport());
