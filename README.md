# tablex MCP Server

MCP stdio server for tablex. It talks to tablex's local authenticated bridge instead of opening database connections directly.

The server reads bridge port/token files from tablex Application Support and returns redacted connection summaries.

Current tools:

- `tablex_ping`: checks whether the tablex local bridge is reachable.
- `tablex_list_connections`: lists saved connections without credentials.

## Development

```bash
npm install
npm test
```

## Release Package

```bash
npm run package:release
```

This writes a bundled tarball under `release/` containing `dist/`, `bin/`, and production `node_modules/` so tablex can install it without running `npm install -g`.

## Remote

`git@github.com:tablex-org/tablex-mcp-server.git`
