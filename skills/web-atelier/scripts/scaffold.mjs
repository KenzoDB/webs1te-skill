#!/usr/bin/env node
// Scaffold or top up a Next.js + Tailwind 4 project for web-atelier, without overwriting anything.
// Usage: node scaffold.mjs [project-root] [--inventory]
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const withInventory = args.includes("--inventory");
const root = path.resolve(args.find((a) => !a.startsWith("--")) || process.cwd());
const skill = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const log = (m) => console.log(`[atelier] ${m}`);
const run = (cmd, cwd = root) => execSync(cmd, { cwd, stdio: ["ignore", "ignore", "inherit"], shell: true });

fs.mkdirSync(root, { recursive: true });

// 1. Next.js app (created beside, then moved in, so existing BRIEF/DESIGN/images survive)
if (!fs.existsSync(path.join(root, "package.json"))) {
  const tmp = path.join(root, ".atelier", "app");
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(tmp), { recursive: true });
  log("creating Next.js app…");
  run(
    `npx --yes create-next-app@latest "${tmp}" --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --skip-install --disable-git --yes`,
    path.dirname(tmp),
  );
  for (const entry of fs.readdirSync(tmp)) {
    const dest = path.join(root, entry);
    if (fs.existsSync(dest)) {
      if (entry === "public") fs.cpSync(path.join(tmp, entry), dest, { recursive: true, force: false });
      continue;
    }
    fs.renameSync(path.join(tmp, entry), dest);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
} else log("package.json found — topping up only");

// 2. Dependencies (only missing ones)
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const have = { ...pkg.dependencies, ...pkg.devDependencies };
const deps = ["gsap", "lenis", "three", "motion"].filter((d) => !have[d]);
const dev = ["@types/three"].filter((d) => !have[d]);
log("installing…");
run("npm install --no-audit --no-fund --loglevel=error");
if (deps.length) run(`npm install --no-audit --no-fund --loglevel=error ${deps.join(" ")}`);
if (dev.length) run(`npm install -D --no-audit --no-fund --loglevel=error ${dev.join(" ")}`);

// 3. Kit (never overwrite)
const copies = [
  ["kit/lib/gsap.ts", "src/lib/gsap.ts"],
  ["kit/components/motion/SmoothScroll.tsx", "src/components/motion/SmoothScroll.tsx"],
  ...["HeroGL.tsx", "DistortImage.tsx", "distortRenderer.ts", "shaders.ts"].map((f) => [
    `kit/components/motion/gl/${f}`,
    `src/components/motion/gl/${f}`,
  ]),
];
let copied = 0;
for (const [from, to] of copies) {
  const dest = path.join(root, to);
  if (fs.existsSync(dest)) continue;
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(skill, from), dest);
  copied++;
}

// 3b. Live stock module (only with --inventory)
if (withInventory) {
  const map = [
    ["kit/inventory/lib/inventory", "src/lib/inventory"],
    ["kit/inventory/app/api/inventory", "src/app/api/inventory"],
    ["kit/inventory/components/inventory", "src/components/inventory"],
    ["kit/inventory/content/inventory.demo.json", "src/content/inventory.demo.json"],
  ];
  for (const [from, to] of map) {
    const dest = path.join(root, to);
    if (fs.existsSync(dest)) continue;
    fs.cpSync(path.join(skill, from), dest, { recursive: true });
    copied++;
  }
  if (!have["server-only"]) run("npm install --no-audit --no-fund --loglevel=error server-only");
  const envFile = path.join(root, ".env.example");
  const block = fs.readFileSync(path.join(skill, "kit/inventory/env.example"), "utf8");
  const current = fs.existsSync(envFile) ? fs.readFileSync(envFile, "utf8") : "";
  if (!current.includes("INVENTORY_SOURCE")) fs.writeFileSync(envFile, current + block);
  log("inventory module installed (INVENTORY_SOURCE=demo until configured)");
}

// 4. Folders and preview config
for (const d of ["src/content", "src/components/sections", "src/components/shell", "src/components/signature", "public/images", ".atelier/shots", "strategy"])
  fs.mkdirSync(path.join(root, d), { recursive: true });
// create-next-app ignores `.env*`; keep the documented example in git
const gi = path.join(root, ".gitignore");
if (fs.existsSync(gi) && !fs.readFileSync(gi, "utf8").includes("!.env.example")) fs.appendFileSync(gi, "\n!.env.example\n");
const launch = path.join(root, ".claude", "launch.json");
if (!fs.existsSync(launch)) {
  fs.mkdirSync(path.dirname(launch), { recursive: true });
  fs.writeFileSync(
    launch,
    JSON.stringify({ version: "0.0.1", configurations: [{ name: "dev", runtimeExecutable: "npm", runtimeArgs: ["run", "dev"], port: 3000 }] }, null, 2),
  );
}

// Next 16 route types (LayoutProps, PageProps) exist only after typegen; agents' `tsc --noEmit` needs them.
try { run("npx next typegen"); } catch { log("next typegen unavailable — run `npm run build` once before tsc"); }

const v = (n) => {
  try { return JSON.parse(fs.readFileSync(path.join(root, "node_modules", n, "package.json"), "utf8")).version; } catch { return "?"; }
};
log(`kit files copied: ${copied}`);
log(`versions: next ${v("next")} · react ${v("react")} · tailwindcss ${v("tailwindcss")} · gsap ${v("gsap")} · lenis ${v("lenis")} · three ${v("three")} · motion ${v("motion")}`);
log("done");
