import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { AppDeps } from "./appDeps.ts";

/**
 * CWE-434: avatar upload on /account (write under public/uploads).
 *
 * Exercises 1–2: leave the next line as-is (`false`).
 * Exercise 3: uncomment the line below and comment out `false`.
 */
const USE_SAFE_UPLOAD = false;
// const USE_SAFE_UPLOAD = true;

export const UPLOAD_MAX_BYTES = 2_000_000;

const previewByLogin = new Map<string, string>();

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
  return true;
}