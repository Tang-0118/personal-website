#!/usr/bin/env node
/**
 * Build the first-paint cat bundle from the full neko bundle.
 * The lite file contains the engine, gif sprite and only the default "spirit"
 * breed. The full bundle is loaded later if the visitor opens the breed picker.
 */
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const sourcePath = path.join(root, "assets/js/neko-ts/neko-bundle.js");
const outputPath = path.join(root, "assets/js/neko-ts/neko-bundle-lite.js");
const lines = fs.readFileSync(sourcePath, "utf8").trimEnd().split(/\r?\n/);

const firstBreed = lines.findIndex((line) => /^var [A-Za-z0-9_$]+=\{src:"data:image\//.test(line));
const spirit = lines.find((line) => line.startsWith("var spirit={src:"));
const expose = lines.find((line) => line.startsWith("window.Neko="));

if (firstBreed < 1 || !spirit || !expose) {
  throw new Error("neko bundle layout changed; update build_neko_lite.mjs");
}

const output = [
  "/*! neko-ts v0.0.7 (MIT) — lightweight first-paint bundle */",
  "/*! Generated from neko-bundle.js; only the default spirit breed is included. */",
  ...lines.slice(0, firstBreed),
  spirit,
  expose,
  "window.nekoBreeds={spirit:spirit};",
  "",
].join("\n");

fs.writeFileSync(outputPath, output);
console.log(
  `built ${path.relative(root, outputPath)} (${(Buffer.byteLength(output) / 1024).toFixed(1)} KB)`,
);
