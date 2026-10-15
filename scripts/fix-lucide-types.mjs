/**
 * lucide-react ships `typings` but not `types`. Some TS language services
 * (moduleResolution: bundler) then resolve the CJS entry without declarations.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pkgPath = path.join(root, "node_modules", "lucide-react", "package.json");

if (!fs.existsSync(pkgPath)) {
  process.exit(0);
}

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
const typesEntry = pkg.types || pkg.typings;
if (!typesEntry) process.exit(0);

let changed = false;
if (pkg.types !== typesEntry) {
  pkg.types = typesEntry;
  changed = true;
}
if (!pkg.exports) {
  pkg.exports = {
    ".": {
      types: `./${typesEntry}`,
      import: "./dist/esm/lucide-react.mjs",
      require: "./dist/cjs/lucide-react.js",
      default: "./dist/cjs/lucide-react.js",
    },
  };
  changed = true;
}

if (changed) {
  fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
  console.log("[fix-lucide-types] patched lucide-react package.json types/exports");
}
