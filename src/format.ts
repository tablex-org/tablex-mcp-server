export function redactConnectionURI(uri: string): string {
  try {
    const parsed = new URL(uri);
    const host = parsed.hostname;
    const port = parsed.port ? `:${parsed.port}` : "";
    const path = parsed.pathname === "/" ? "" : parsed.pathname;
    const query = parsed.search;
    const location = `${host}${port}${path}${query}`;
    return location || "local";
  } catch {
    return "";
  }
}

export function mdTable(headers: string[], rows: string[][]): string {
  const line = (cells: string[]) => `| ${cells.map(escapeCell).join(" | ")} |`;
  return [
    line(headers),
    line(headers.map(() => "---")),
    ...rows.map(line),
  ].join("\n");
}

function escapeCell(value: string): string {
  return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " ");
}
