/**
 * Start Next.js using PORT from environment / .env, else fallback.
 * Usage: node scripts/next-port.mjs <dev|start> <fallbackPort>
 */
import { existsSync, readFileSync } from "fs";
import { spawn } from "child_process";

function loadDotEnv() {
  if (!existsSync(".env")) return;
  for (const line of readFileSync(".env", "utf8").split("\n")) {
    const t = line.trim();
    if (!t || t.startsWith("#")) continue;
    const i = t.indexOf("=");
    if (i < 0) continue;
    const key = t.slice(0, i).trim();
    let val = t.slice(i + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    // Do not override vars already set by the shell / host
    if (process.env[key] === undefined) process.env[key] = val;
  }
}

loadDotEnv();

const mode = process.argv[2] === "dev" ? "dev" : "start";
const fallback = process.argv[3] || "3005";
const port = String(process.env.PORT || fallback);

console.log(`[ananta-storefront] Using PORT=${port}${process.env.PORT ? " (from env)" : ` (fallback ${fallback})`}`);

const child = spawn("npx", ["next", mode, "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PORT: port },
});

child.on("exit", (code) => process.exit(code ?? 0));
