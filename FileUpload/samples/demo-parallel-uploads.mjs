#!/usr/bin/env node
/**
 * Classroom automation: many parallel POST /account/avatar on the local lab only.
 * Shows missing per-user upload quotas (disk fill), not a network flood.
 *
 *   node samples/demo-parallel-uploads.mjs
 *   node samples/demo-parallel-uploads.mjs --count 25 --concurrency 8
 *
 * Requires: npm run dev in server/, USE_SAFE_UPLOAD = false, unique filenames per request.
 */
import { parseArgs } from "node:util";

const BASE = "http://127.0.0.1:3005";
const DEFAULT_COUNT = 20;
const DEFAULT_CONCURRENCY = 6;
const FILE_BYTES = 64 * 1024; // 64 KiB each

const { values } = parseArgs({
  options: {
    count: { type: "string", default: String(DEFAULT_COUNT) },
    concurrency: { type: "string", default: String(DEFAULT_CONCURRENCY) },
    login: { type: "string", default: "marc" },
    password: { type: "string", default: "marc123" },
    base: { type: "string", default: BASE },
  },
});

const count = Math.min(200, Math.max(1, Number(values.count) || DEFAULT_COUNT));
const concurrency = Math.min(32, Math.max(1, Number(values.concurrency) || DEFAULT_CONCURRENCY));
const login = values.login;
const password = values.password;
const baseUrl = values.base.replace(/\/$/, "");

if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?$/i.test(baseUrl)) {
  console.error("Refusing to run: --base must be http://127.0.0.1:PORT or http://localhost:PORT");
  process.exit(1);
}

async function fetchSessionCookie() {
  const res = await fetch(`${baseUrl}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ login, password }),
    redirect: "manual",
  });
  const raw = res.headers.get("set-cookie") ?? "";
  const match = raw.match(/session=([^;]+)/);
  if (!match) {
    throw new Error(`Login failed (status ${res.status}). Is the lab running?`);
  }
  return `session=${match[1]}`;
}

function tinyJpegBuffer() {
  // Minimal valid JPEG structure — lab does not validate magic bytes in exercise 5-style demos.
  const header = Buffer.from([
    0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01,
  ]);
  const pad = Buffer.alloc(FILE_BYTES - header.length, 0);
  return Buffer.concat([header, pad]);
}

async function uploadOne(cookie, index) {
  const body = tinyJpegBuffer();
  const form = new FormData();
  form.append("avatar", new Blob([body], { type: "image/jpeg" }), `quota-demo-${index}.jpg`);

  const res = await fetch(`${baseUrl}/account/avatar`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
    redirect: "manual",
  });
  const location = res.headers.get("location") ?? "";
  const ok = res.status === 302 && location.includes("/account") && !location.includes("error=invalid");
  return { index, status: res.status, location, ok };
}

async function runPool(cookie, total, parallel) {
  const results = [];
  let next = 1;

  async function worker() {
    while (true) {
      const i = next++;
      if (i > total) {
        return;
      }
      results.push(await uploadOne(cookie, i));
    }
  }

  await Promise.all(Array.from({ length: parallel }, () => worker()));
  results.sort((a, b) => a.index - b.index);
  return results;
}

const cookie = await fetchSessionCookie();
console.log(`Target ${baseUrl} — ${count} uploads, concurrency ${concurrency}, ~${FILE_BYTES} B each`);
const started = Date.now();
const results = await runPool(cookie, count, concurrency);
const ok = results.filter((r) => r.ok).length;
const failed = results.filter((r) => !r.ok);
console.log(`Done in ${Date.now() - started} ms — OK ${ok}/${count}`);
if (failed.length > 0) {
  console.log("Failures:", failed.slice(0, 5));
  if (failed.length > 5) {
    console.log(`… and ${failed.length - 5} more`);
  }
}
console.log(`Check disk: ls -la server/public/uploads/quota-demo-*.jpg`);
process.exit(ok === count ? 0 : 1);