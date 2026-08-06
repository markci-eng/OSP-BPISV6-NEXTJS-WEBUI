#!/usr/bin/env node
/**
 * Build-time asset discovery for the service worker.
 *
 * Runs after `next build` and writes `public/sw-manifest.json` — the single
 * source of truth the service worker uses to know:
 *
 *   1. WHICH files make up the application shell (no hardcoded filenames), and
 *   2. WHETHER the deployment currently on the server differs from the one the
 *      user has cached (via the top-level `revision` hash).
 *
 * Why walk the filesystem instead of parsing `.next/build-manifest.json`?
 * The internal manifest schema differs between Webpack and Turbopack and has
 * changed across Next majors (Next 16 + Turbopack, for example, emits no
 * `app-build-manifest.json`). The emitted files under `.next/static` are stable
 * across all of them, so walking the output directory is the version-proof
 * approach.
 *
 * Output shape:
 * {
 *   "buildId":   "nz-THmemiXViF3rK31HRK",
 *   "revision":  "9f2c1a…",          // hash of the whole asset set
 *   "generatedAt": "2026-07-29T…",
 *   "totalBytes": 8912345,
 *   "assets": [ { "url": "/_next/static/chunks/abc.js", "hash": "…", "size": 1234 } ]
 * }
 */

import { createHash } from "node:crypto";
import { readdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

const NEXT_DIR = path.join(PROJECT_ROOT, ".next");
const STATIC_DIR = path.join(NEXT_DIR, "static");
const PUBLIC_DIR = path.join(PROJECT_ROOT, "public");
const OUTPUT_FILE = path.join(PUBLIC_DIR, "sw-manifest.json");

/* -------------------------------------------------------------------------- */
/* Discovery rules                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Extensions worth precaching from `.next/static`. Everything the UI needs to
 * boot and render: code, styles, fonts and the small media Next inlines there.
 */
const STATIC_EXTENSIONS = new Set([
  ".js",
  ".mjs",
  ".css",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".svg",
  ".png",
  ".webp",
  ".json",
]);

/** Extensions worth precaching from `public/`. */
const PUBLIC_EXTENSIONS = new Set([
  ".html",
  ".json",
  ".svg",
  ".png",
  ".webp",
  ".ico",
  ".jpg",
  ".jpeg",
  ".woff",
  ".woff2",
  ".mjs",
]);

/**
 * `public/` directories that must never be precached. `documents/` and the
 * multi-megabyte plan artwork are fetched on demand at runtime instead
 * (stale-while-revalidate), so the install step stays fast on mobile data.
 */
const PUBLIC_EXCLUDED_DIRS = new Set(["documents", "sw", "images/plan-images"]);

/**
 * Service-worker infrastructure is deliberately NOT precached — the browser
 * revalidates these on its own update check, and precaching them would make the
 * worker unable to ever see a newer copy of itself.
 */
const PUBLIC_EXCLUDED_FILES = new Set([
  "service-worker.js",
  "sw-manifest.json",
]);

/**
 * Per-file size ceiling for precached `public/` assets (1.5 MB). Keeps the
 * atomic install payload bounded; anything larger is a runtime-cache candidate.
 */
const PUBLIC_MAX_FILE_BYTES = 1.5 * 1024 * 1024;

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

/** Short, collision-safe content hash used for per-asset change detection. */
function hashBuffer(buffer) {
  return createHash("sha256").update(buffer).digest("hex").slice(0, 16);
}

/**
 * Converts an OS path into a URL path.
 * Windows backslashes become slashes and each segment is percent-encoded so
 * filenames such as `St. Peter Miter Logo.png` produce a fetchable URL.
 */
function toUrlPath(prefix, relativePath) {
  const segments = relativePath.split(path.sep).map(encodeURIComponent);
  return `${prefix}/${segments.join("/")}`;
}

/** Recursively lists every file under `dir` as a path relative to `dir`. */
async function walk(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(absolute, base)));
    } else if (entry.isFile()) {
      files.push(path.relative(base, absolute));
    }
  }

  return files;
}

/**
 * Assets the UI cannot render without. A failure to download any of these
 * aborts the whole update; everything else is best-effort (see `toAsset`).
 *
 * The distinction matters because `public/` files can be gated by the auth
 * proxy — a stray image redirecting to /login must not be able to block every
 * future release, while a missing JS chunk absolutely must.
 */
function isRequired(url) {
  return (
    url.startsWith("/_next/static/") ||
    url === "/offline.html" ||
    url === "/manifest.json"
  );
}

/** Reads a file and returns its manifest entry. */
async function toAsset(absolutePath, url) {
  const buffer = await readFile(absolutePath);
  return {
    url,
    hash: hashBuffer(buffer),
    size: buffer.byteLength,
    required: isRequired(url),
  };
}

/* -------------------------------------------------------------------------- */
/* Collectors                                                                 */
/* -------------------------------------------------------------------------- */

/** Every hashed chunk, stylesheet, font and media file Next emitted. */
async function collectNextStaticAssets() {
  if (!existsSync(STATIC_DIR)) {
    throw new Error(
      `Missing ${STATIC_DIR}. Run \`next build\` before generating the SW manifest.`,
    );
  }

  const files = await walk(STATIC_DIR);
  const assets = [];

  for (const relativePath of files) {
    const normalized = relativePath.split(path.sep).join("/");

    // Source maps are debug-only; dev artifacts never exist in a prod build but
    // are guarded against anyway so a stale `.next` cannot poison the manifest.
    if (normalized.endsWith(".map")) continue;
    if (normalized.startsWith("development/")) continue;
    if (!STATIC_EXTENSIONS.has(path.extname(normalized).toLowerCase())) continue;

    assets.push(
      await toAsset(
        path.join(STATIC_DIR, relativePath),
        toUrlPath("/_next/static", relativePath),
      ),
    );
  }

  return assets;
}

/** Icons, manifest, offline page and other small `public/` files. */
async function collectPublicAssets() {
  const files = await walk(PUBLIC_DIR);
  const assets = [];

  for (const relativePath of files) {
    const normalized = relativePath.split(path.sep).join("/");

    if (PUBLIC_EXCLUDED_FILES.has(normalized)) continue;
    if (
      [...PUBLIC_EXCLUDED_DIRS].some(
        (dir) => normalized === dir || normalized.startsWith(`${dir}/`),
      )
    ) {
      continue;
    }
    if (!PUBLIC_EXTENSIONS.has(path.extname(normalized).toLowerCase())) continue;

    const absolute = path.join(PUBLIC_DIR, relativePath);
    const { size } = await stat(absolute);
    if (size > PUBLIC_MAX_FILE_BYTES) continue;

    assets.push(await toAsset(absolute, toUrlPath("", relativePath)));
  }

  return assets;
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                */
/* -------------------------------------------------------------------------- */

async function main() {
  const [staticAssets, publicAssets] = await Promise.all([
    collectNextStaticAssets(),
    collectPublicAssets(),
  ]);

  // Deduplicate by URL and sort so the revision hash is deterministic across
  // machines and filesystem iteration order.
  const byUrl = new Map();
  for (const asset of [...staticAssets, ...publicAssets]) {
    byUrl.set(asset.url, asset);
  }
  const assets = [...byUrl.values()].sort((a, b) => a.url.localeCompare(b.url));

  // The deployment fingerprint. Changes if any file is added, removed or
  // modified — this is what the service worker polls to detect a new release.
  const revision = createHash("sha256")
    .update(assets.map((a) => `${a.url}:${a.hash}`).join("\n"))
    .digest("hex")
    .slice(0, 16);

  const buildIdPath = path.join(NEXT_DIR, "BUILD_ID");
  const buildId = existsSync(buildIdPath)
    ? (await readFile(buildIdPath, "utf8")).trim()
    : revision;

  const totalBytes = assets.reduce((sum, asset) => sum + asset.size, 0);
  const requiredCount = assets.filter((asset) => asset.required).length;

  const manifest = {
    buildId,
    revision,
    generatedAt: new Date().toISOString(),
    totalBytes,
    assets,
  };

  await writeFile(OUTPUT_FILE, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  console.log(
    `[sw-manifest] ${assets.length} assets (${requiredCount} required) · ${mb} MB · ` +
      `revision ${revision} · build ${buildId}`,
  );
}

main().catch((error) => {
  console.error("[sw-manifest] generation failed:", error);
  process.exit(1);
});
