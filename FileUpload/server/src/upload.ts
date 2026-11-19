import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppDeps } from "./appDeps.ts";
import { inflateFirstZipEntry, type ZipInflateResult } from "./zipBomb.ts";

/**
 * CWE-434: avatar upload on /account (write under public/uploads).
 *
 * Exercises 1–2 and 5: leave the next line as-is (`false`).
 * Exercise 3: uncomment the line below and comment out `false`.
 */
const USE_SAFE_UPLOAD = false;
// const USE_SAFE_UPLOAD = true;

export const UPLOAD_MAX_BYTES = 2_000_000;

const previewByLogin = new Map<string, string>();
const zipPreviewByLogin = new Map<string, ZipInflateResult>();

export function avatarPreviewFor(login: string): string | undefined {
  return previewByLogin.get(login);
}

function previewUsesImageTag(publicPath: string): boolean {
  return /\.(jpe?g|png)$/i.test(publicPath);
}

export function buildAvatarPreview(publicPath: string | undefined): string {
  if (publicPath === undefined) {
    return `<p class="blurb">No profile photo yet.</p>`;
  }
  const openLink = `<p class="blurb"><a class="download-link" href="${publicPath}" target="_blank" rel="noopener">Open uploaded file</a></p>`;
  const img = `<img class="avatar-preview" src="${publicPath}" alt="Your profile photo" />`;
  if (previewUsesImageTag(publicPath)) {
    return `${img}
          ${openLink}`;
  }
  const unsafeIframeDemo = `<section class="avatar-antipattern" aria-labelledby="avatar-antipattern-title">
            <h3 class="avatar-antipattern__title" id="avatar-antipattern-title">Anti-pattern (do not ship)</h3>
            <p class="blurb">A real avatar should use <code>&lt;img&gt;</code> only (see above). This <code>&lt;iframe&gt;</code> is here on purpose: some products preview attachments in a frame, which can run HTML/SVG as a document on this origin.</p>
            <iframe class="avatar-preview-frame" title="Unsafe upload preview demo" src="${publicPath}"></iframe>
          </section>`;
  return `${img}
          ${unsafeIframeDemo}
          ${openLink}`;
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

export function buildZipPreview(login: string): string {
  const result = zipPreviewByLogin.get(login);
  if (result === undefined) {
    return "";
  }
  const capNote = result.capped
    ? `Naive unzip started inflating <code>${escapeHtml(result.name)}</code> and this lab stopped at ${result.inflatedBytes.toLocaleString("en-US")} bytes so the machine survives.`
    : `Unzip produced ${result.inflatedBytes.toLocaleString("en-US")} bytes for <code>${escapeHtml(result.name)}</code>.`;
  return `<section class="zip-preview" aria-labelledby="zip-preview-title">
            <h3 class="zip-preview__title" id="zip-preview-title">Zip preview (vulnerable lab)</h3>
            <p>Archive was <strong>${result.archiveBytes.toLocaleString("en-US")} bytes</strong> — under the ${UPLOAD_MAX_BYTES.toLocaleString("en-US")} MAX.</p>
            <p>ZIP header claims <strong>${result.claimedUncompressed.toLocaleString("en-US")} uncompressed bytes</strong>.</p>
            <p>${capNote} Without a cap, the shop keeps allocating RAM until it stalls (application-layer DoS, CWE-409).</p>
          </section>`;
}

export async function saveUploadedAvatar(
  deps: AppDeps,
  login: string,
  file: { originalname: string; mimetype: string; size: number; buffer: Buffer },
): Promise<boolean> {
  if (file.size === 0 || file.size > UPLOAD_MAX_BYTES) {
    return false;
  }

  await mkdir(deps.uploadsDir, { recursive: true });

  let filename: string;
  if (USE_SAFE_UPLOAD) {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      return false;
    }
    const ext = file.mimetype === "image/png" ? ".png" : ".jpg";
    filename = `${login}-${randomUUID()}${ext}`;
  } else {
    filename = file.originalname.replace(/\\/g, "/");
  }

  await writeFile(join(deps.uploadsDir, filename), file.buffer);
  previewByLogin.set(login, `/uploads/${filename}`);

  /**
   * Exercise 5 (vulnerable): a shop that “previews” a zip by unpacking it.
   * UPLOAD_MAX_BYTES already passed — that only measured the archive on the wire.
   * Leave USE_SAFE_UPLOAD = false for this demo.
   */
  const looksLikeZip =
    filename.toLowerCase().endsWith(".zip") ||
    file.mimetype === "application/zip" ||
    file.mimetype === "application/x-zip-compressed";
  if (looksLikeZip) {
    const result = inflateFirstZipEntry(file.buffer);
    if (result !== undefined) {
      zipPreviewByLogin.set(login, result);
      console.log(
        `[zip-preview] ${login} archive=${result.archiveBytes} claimed=${result.claimedUncompressed} inflated=${result.inflatedBytes} capped=${result.capped}`,
      );
    } else {
      zipPreviewByLogin.delete(login);
    }
  } else {
    zipPreviewByLogin.delete(login);
  }

  return true;
}