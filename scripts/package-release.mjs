import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { spawn } from "node:child_process";
import packageJSON from "../package.json" with { type: "json" };

const root = new URL("..", import.meta.url).pathname;
const releaseRoot = join(root, "release");
const packageName = `${packageJSON.name.replace("/", "-").replace("@", "")}-${packageJSON.version}`;
const packageDir = join(releaseRoot, packageName);
const tarball = join(releaseRoot, `${packageName}.tar.gz`);

await run("npm", ["run", "build"], root);
await rm(releaseRoot, { recursive: true, force: true });
await mkdir(join(packageDir, "bin"), { recursive: true });
await mkdir(join(packageDir, "dist"), { recursive: true });

await cp(join(root, "dist", "src"), join(packageDir, "dist", "src"), { recursive: true });
await cp(join(root, "node_modules"), join(packageDir, "node_modules"), { recursive: true });
await cp(join(root, "server.json"), join(packageDir, "server.json"));
await cp(join(root, "bin", "tablex-mcp-server"), join(packageDir, "bin", "tablex-mcp-server"));
await writeFile(join(packageDir, "package.json"), `${JSON.stringify(packageJSON, null, 2)}\n`);

await run("tar", ["-czf", basename(tarball), packageName], releaseRoot);
await run("shasum", ["-a", "256", basename(tarball)], releaseRoot);

function run(command, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, stdio: "inherit" });
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(" ")} exited ${code}`));
    });
    child.on("error", reject);
  });
}
