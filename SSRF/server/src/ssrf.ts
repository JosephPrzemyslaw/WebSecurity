/**
 * CWE-918: server fetches user-supplied URL for "cover import" on /members.
 *
 * Ex 1–2: `USE_SAFE_SSRF = false`. Ex 3 (fix): `true` — block private/loopback hosts.
 */

export const USE_SAFE_SSRF = false;
// export const USE_SAFE_SSRF = true;

const MAX_RESPONSE_BYTES = 500_000;
const FETCH_TIMEOUT_MS = 8_000;

export function buildCoverImportSection(
  lastUrl: string | undefined,
  resultHtml: string | undefined,
): string {
  const value = lastUrl === undefined ? "" : escapeHtmlAttr(lastUrl);
  const preview =
    resultHtml === undefined
      ? `<p class="empty">Submit a URL to see what the server fetched.</p>`
      : `<div class="cover-fetch-result">${resultHtml}</div>`;
  return `<section class="cover-import-section">
          <h2>Import cover from URL</h2>
          <p class="blurb">The server <strong>fetches</strong> this URL and shows the response below (SSRF lab).</p>
          ${preview}
          <form class="cover-import-form" method="get" action="/members">
            <div class="field">
              <label for="coverUrl">Image URL</label>
              <input id="coverUrl" name="coverUrl" maxlength="2000" value="${value}" placeholder="https://example.com/cover.jpg" />
            </div>
            <button class="submit submit--compact" type="submit">Fetch on server</button>
          </form>
        </section>`;
}

export async function fetchCoverForLab(urlString: string): Promise<{
  ok: boolean;
  status?: number;
  contentType?: string;
  previewHtml: string;
}> {
  let parsed: URL;
  try {
    parsed = new URL(urlString);
  } catch {
    return { ok: false, previewHtml: `<p class="error">Invalid URL.</p>` };
  }

  if (USE_SAFE_SSRF && !isAllowedFetchTarget(parsed)) {
    return {
      ok: false,
      previewHtml: `<p class="error">Blocked by SSRF policy (private or disallowed host).</p>`,
    };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, previewHtml: `<p class="error">Only http/https URLs.</p>` };
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(parsed.toString(), { signal: controller.signal, redirect: "follow" });
    clearTimeout(timer);

    const buf = Buffer.from(await response.arrayBuffer());
    const clipped = buf.subarray(0, MAX_RESPONSE_BYTES);
    const contentType = response.headers.get("content-type") ?? "application/octet-stream";
    const isImage = contentType.startsWith("image/");

    let bodyBlock: string;
    if (isImage) {
      const b64 = clipped.toString("base64");
      bodyBlock = `<p class="blurb">Status <strong>${response.status}</strong>, type <code>${escapeHtml(contentType)}</code>, ${clipped.length} bytes (clipped).</p>
        <img class="cover-fetch-img" alt="Fetched cover" src="data:${escapeHtmlAttr(contentType)};base64,${b64}" />`;
    } else {
      const text = clipped.toString("utf8");
      const snippet = escapeHtml(text.slice(0, 1200)) + (text.length > 1200 ? "…" : "");
      bodyBlock = `<p class="blurb">Status <strong>${response.status}</strong>, type <code>${escapeHtml(contentType)}</code>.</p>
        <pre class="cover-fetch-snippet">${snippet}</pre>`;
    }

    return {
      ok: response.ok,
      status: response.status,
      contentType,
      previewHtml: `<p class="blurb">Server requested: <code>${escapeHtml(parsed.toString())}</code></p>${bodyBlock}`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Fetch failed";
    return { ok: false, previewHtml: `<p class="error">${escapeHtml(message)}</p>` };
  }
}

function isAllowedFetchTarget(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".localhost")) {
    return false;
  }
  if (host === "0.0.0.0" || host === "::1" || host === "[::1]") {
    return false;
  }
  if (host === "169.254.169.254" || host === "metadata.google.internal") {
    return false;
  }
  if (/^127\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }
  if (/^10\.\d+\.\d+\.\d+$/.test(host)) {
    return false;
  }
  if (/^192\.168\.\d+\.\d+$/.test(host)) {
    return false;
  }
  const m = /^172\.(\d+)\.\d+\.\d+$/.exec(host);
  if (m !== null) {
    const second = Number(m[1]);
    if (second >= 16 && second <= 31) {
      return false;
    }
  }
  return true;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeHtmlAttr(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}