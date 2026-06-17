import { access, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const appRepo = requiredEnv("APP_REPO");
const version = requiredEnv("VERSION").replace(/^v/, "");
const tarballURL = requiredEnv("TARBALL_URL");
const sha256 = requiredEnv("SHA256");
const sizeBytes = Number(requiredEnv("SIZE_BYTES"));

if (!Number.isSafeInteger(sizeBytes) || sizeBytes <= 0) {
  throw new Error(`Invalid SIZE_BYTES: ${process.env.SIZE_BYTES}`);
}

const manifestPaths = [
  join(appRepo, "drivers-manifest.json"),
  join(appRepo, "dist", "drivers", "drivers-manifest.json"),
];

for (const manifestPath of manifestPaths) {
  if (!(await exists(manifestPath))) {
    console.log(`Skipping missing manifest: ${manifestPath}`);
    continue;
  }

  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const tool = manifest.tools?.find((entry) => entry.id === "tablex-mcp-server");
  if (!tool) {
    throw new Error(`tablex-mcp-server not found in ${manifestPath}`);
  }
  const artifact = tool.artifacts?.find((entry) => entry.platform === "darwin" && entry.arch === "universal");
  if (!artifact) {
    throw new Error(`darwin universal artifact not found in ${manifestPath}`);
  }

  tool.version = version;
  artifact.url = tarballURL;
  artifact.sha256 = sha256;
  artifact.sizeBytes = sizeBytes;

  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}
