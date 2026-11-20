/** First bytes of a JPEG bitstream (SOI + start of next marker). */
export function bufferLooksLikeJpeg(buf: Buffer): boolean {
  return buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff;
}

/** PNG file signature per RFC 2083. */
export function bufferLooksLikePng(buf: Buffer): boolean {
  const sig = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buf.length < sig.length) {
    return false;
  }
  for (let i = 0; i < sig.length; i++) {
    if (buf[i] !== sig[i]) {
      return false;
    }
  }
  return true;
}

/** MIME from the multipart part must match file magic (lab — not a full decoder). */
export function bufferMatchesDeclaredImageMime(buf: Buffer, mimetype: string): boolean {
  if (mimetype === "image/jpeg") {
    return bufferLooksLikeJpeg(buf);
  }
  if (mimetype === "image/png") {
    return bufferLooksLikePng(buf);
  }
  return false;
}