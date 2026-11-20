/**
 * CWE-80 / markup in profile: HTML bio (stored) and CSS accent (stored, inline style).
 * XSS opinions are handled in comments.ts (fixed in this chapter).
 *
 * HTML exercises 1–3: `USE_SAFE_PROFILE_HTML = false`.
 * CSS exercises 4–5: `USE_SAFE_PROFILE_CSS = false`.
 * Fix: turn both flags on.
 */

/** Hardened after [HtmlInjection](../../HtmlInjection/) chapter 8. */
export const USE_SAFE_PROFILE_HTML = true;

export const USE_SAFE_PROFILE_CSS = true;

const bioByLogin = new Map<string, string>();
const accentByLogin = new Map<string, string>();

const MAX_BIO = 2000;
const MAX_ACCENT = 120;

export function setProfileBio(login: string, bio: string): boolean {
  if (bio.length === 0 || bio.length > MAX_BIO) {
    return false;
  }
  bioByLogin.set(login, bio);
  return true;
}

export function setProfileAccent(login: string, accent: string): boolean {
  if (accent.length === 0 || accent.length > MAX_ACCENT) {
    return false;
  }
  accentByLogin.set(login, accent);
  return true;
}

export function bioFor(login: string): string | undefined {
  return bioByLogin.get(login);
}

export function accentFor(login: string): string | undefined {
  return accentByLogin.get(login);
}

function escapeHtmlAttribute(value: string): string {
  return escapeHtml(value).replaceAll("'", "&#39;");
}

export function buildAccountBioBlock(login: string): string {
  const raw = bioFor(login);
  const body = raw === undefined ? "" : renderProfileHtml(raw);
  const bioValue = raw ?? "";
  const accentValue = accentFor(login) ?? "";
  return `<section class="profile-bio-section">
          <h2 class="profile-bio-section__title">Public profile</h2>
          <p class="blurb">Bio and accent are stored and shown on <code>/members</code> in <strong>Reader spotlight</strong> (HTML + CSS injection lab; opinions are escaped).</p>
          <div class="profile-bio-preview profile-bio-preview--account">${body || "<p class=\"empty\">No bio yet.</p>"}</div>
          <form class="profile-form" method="post" action="/account/profile">
            <div class="field">
              <label for="bio">Bio (HTML allowed when flag off)</label>
              <textarea id="bio" name="bio" maxlength="2000" rows="4">${escapeHtml(bioValue)}</textarea>
            </div>
            <div class="field">
              <label for="accent">Accent color (CSS in <code>border-left-color</code>)</label>
              <input id="accent" name="accent" maxlength="120" value="${escapeHtmlAttribute(accentValue)}" placeholder="crimson" />
            </div>
            <button class="submit submit--compact" type="submit">Save profile</button>
          </form>
        </section>`;
}

export function buildMemberSpotlight(viewerLogin: string, logins: string[]): string {
  const others = logins.filter((name) => name !== viewerLogin);
  if (others.length === 0) {
    return "";
  }
  const cards = others
    .map((name) => {
      const bio = bioFor(name);
      const accent = accentFor(name) ?? "var(--accent)";
      const bioHtml =
        bio === undefined
          ? `<p class="empty">No bio.</p>`
          : `<div class="profile-bio-preview">${renderProfileHtml(bio)}</div>`;
      const styleAttr = renderAccentStyle(accent);
      return `<article class="member-spotlight" style="border-left-color: ${styleAttr}">
        <p class="member-spotlight__login">${escapeHtml(name)}</p>
        ${bioHtml}
      </article>`;
    })
    .join("\n");
  return `<section class="member-spotlight-section">
          <h2>Reader spotlight</h2>
          <p class="blurb">Other members&rsquo; bios and accent colors (stored profile fields).</p>
          ${cards}
        </section>`;
}

function renderProfileHtml(value: string): string {
  if (USE_SAFE_PROFILE_HTML) {
    return escapeHtml(value);
  }
  return value;
}

function renderAccentStyle(value: string): string {
  if (USE_SAFE_PROFILE_CSS) {
    return safeCssColor(value) ?? "var(--accent)";
  }
  return value;
}

function safeCssColor(value: string): string | undefined {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3,8}$/.test(trimmed)) {
    return trimmed;
  }
  if (/^[a-zA-Z]{1,20}$/.test(trimmed)) {
    return trimmed;
  }
  return undefined;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}