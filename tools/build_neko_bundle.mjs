#!/usr/bin/env node
/**
 * build_neko_bundle.mjs
 * ------------------------------------------------------------------
 * 把 neko-ts@0.0.7 的 ESM dist 合并成单个经典脚本 assets/js/neko-ts/neko-bundle.js。
 * 经典脚本没有 import/export，因此 file://（双击打开）、本地 http、GitHub Pages 都可用。
 *
 * 用法（在项目根目录）：
 *   node tools/build_neko_bundle.mjs <dist目录> <输出文件>
 *   示例：node tools/build_neko_bundle.mjs assets/js/neko-ts assets/js/neko-ts/neko-bundle.js
 *
 * 重新生成：先取回 npm 包（npm pack neko-ts@0.0.7 解压出 dist/），再指向该 dist 运行本脚本。
 */
import fs from "node:fs";
import path from "node:path";

const [, , distDirArg, outArg] = process.argv;
if (!distDirArg || !outArg) {
  console.error("用法: node tools/build_neko_bundle.mjs <dist目录> <输出文件>");
  process.exit(1);
}
const dist = path.resolve(distDirArg);
const out = path.resolve(outArg);

/* ---------- 1. types：提取两套精灵坐标表 ---------- */
const typesSrc = fs.readFileSync(path.join(dist, "types-Dq_xM9Tw.js"), "utf8").trim();
const typesRe = /^var l=(.*),a=(.*);export\{l as n,a as t\};$/;
const typesM = typesSrc.match(typesRe);
if (!typesM) throw new Error("types 文件结构不符预期");
const gifSpriteSets = typesM[1];
const breedSpriteSets = typesM[2];

/* ---------- 2. 主模块：去掉 import/export ---------- */
const mainSrc = fs.readFileSync(path.join(dist, "neko-ts.js"), "utf8");
const mainBody = mainSrc
  .replace(/^import\{n as e,t as i\}from"\.\/types-[^"]+\.js";/, "")
  .replace(/export\{o as Neko,t as NekoSizeVariations,i as breedSpriteSets,e as gifSpriteSets\};$/, "")
  .trim();
if (mainBody === mainSrc) throw new Error("主模块 import/export 未剥离");

/* ---------- 3. breeds/index.js：解析 分片文件 -> 花色名 的映射 ---------- */
const idxSrc = fs.readFileSync(path.join(dist, "breeds", "index.js"), "utf8");
const idxImports = [];
const importRe = /import\{t(?: as ([A-Za-z0-9_]+))?\}from"\.\.\/([A-Za-z0-9_-]+)\.js";/g;
let m;
while ((m = importRe.exec(idxSrc))) idxImports.push({ alias: m[1] || "t", chunk: m[2] });
const exportM = idxSrc.match(/export\{([^}]+)\};$/);
if (!exportM) throw new Error("breeds/index.js 的 export 未找到");
const aliasToName = {};
for (const part of exportM[1].split(",")) {
  const p = part.trim().split(" as ");
  if (p.length === 2) aliasToName[p[0]] = p[1];
}
const order = idxImports.map(({ alias, chunk }) => ({ name: aliasToName[alias], chunk }));
if (order.some((o) => !o.name)) throw new Error("花色名映射不完整");

/* ---------- 4. 逐个花色分片：校验形状并提取内嵌 base64 精灵图 ---------- */
const chunkRe = /^import\{t as A\}from"\.\/types-[^"]+\.js";var ([A-Za-z0-9_$]+)=\{src:"([^"]*)",spriteSets:A,gap:1,cols:8,rows:4\};export\{\1 as t\};$/;
const breedLines = [];
for (const { name, chunk } of order) {
  const src = fs.readFileSync(path.join(dist, chunk + ".js"), "utf8").trim();
  const cm = src.match(chunkRe);
  if (!cm) throw new Error(`分片 ${chunk}.js 结构不符预期`);
  breedLines.push(`var ${name}={src:"${cm[2]}",spriteSets:A,gap:1,cols:8,rows:4};`);
}

/* ---------- 5. 拼接输出 ---------- */
const parts = [
  "/*! neko-ts v0.0.7 (MIT) — 本地打包版 */",
  "/*! 由 tools/build_neko_bundle.mjs 从 ESM dist 合并生成，请勿手改。 */",
  "var gifSpriteSets=" + gifSpriteSets + ";",
  "var breedSpriteSets=" + breedSpriteSets + ";",
  "var e=gifSpriteSets,i=breedSpriteSets;",
  mainBody,
  "var A=breedSpriteSets;",
  ...breedLines,
  "window.Neko=o;window.NekoSizeVariations=t;window.breedSpriteSets=i;window.gifSpriteSets=e;",
  "window.nekoBreeds={" + order.map((o) => o.name + ":" + o.name).join(",") + "};",
];
fs.writeFileSync(out, parts.join("\n") + "\n");
console.log(`OK -> ${out}  (${order.length} breeds, ${(fs.statSync(out).size / 1024).toFixed(1)} KB)`);
