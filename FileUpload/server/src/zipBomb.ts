import { inflateRawSync } from "node:zlib";

/** Lab-only ceiling so the demo cannot fill the machine. */
export const ZIP_BOMB_MAX_INFLATE_BYTES = 8 * 1024 * 1024;

export type ZipInflateResult = {
  name: string;
  archiveBytes: number;
  claimedUncompressed: number;
  inflatedBytes: number;
  capped: boolean;
};

function readU16(buf: Buffer, offset: number): number {
  return buf.readUInt16LE(offset);
}

function readU32(buf: Buffer, offset: number): number {
  return buf.readUInt32LE(offset);
}

/**
 * Naive unzip used by the vulnerable preview: inflate the first stored file
 * with no compression-ratio check (only a hard lab cap). Production must not
 * unpack untrusted archives this way.
 */
export function inflateFirstZipEntry(zip: Buffer): ZipInflateResult | undefined {
  if (zip.length < 30 || zip[0] !== 0x50 || zip[1] !== 0x4b || zip[2] !== 0x03 || zip[3] !== 0x04) {
    return undefined;
  }
  const method = readU16(zip, 8);
  const compressedSize = readU32(zip, 18);
  const claimedUncompressed = readU32(zip, 22);
  const nameLength = readU16(zip, 26);
  const extraLength = readU16(zip, 28);
  const nameStart = 30;
  const dataStart = nameStart + nameLength + extraLength;
  if (dataStart + compressedSize > zip.length) {
    return undefined;
  }
  const name = zip.subarray(nameStart, nameStart + nameLength).toString("utf8");
  const payload = zip.subarray(dataStart, dataStart + compressedSize);
  if (method !== 8) {
    return {
      name,
      archiveBytes: zip.length,
      claimedUncompressed,
      inflatedBytes: payload.length,
      capped: false,
    };
  }
  try {
    const inflated = inflateRawSync(payload, { maxOutputLength: ZIP_BOMB_MAX_INFLATE_BYTES });
    return {
      name,
      archiveBytes: zip.length,
      claimedUncompressed,
      inflatedBytes: inflated.length,
      capped: false,
    };
  } catch {
    return {
      name,
      archiveBytes: zip.length,
      claimedUncompressed,
      inflatedBytes: ZIP_BOMB_MAX_INFLATE_BYTES,
      capped: true,
    };
  }
}
