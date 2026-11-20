import ejs from "ejs";

/**
 * CWE-1336: user-supplied EJS template on shipping label preview (`POST /account/shipping`).
 *
 * Exercises 1–2: `USE_SAFE_SSTI = false`.
 * Exercise 3: set to `true` — only the built-in template is rendered.
 */
/** Hardened after [SSTI](../../SSTI/) chapter 9. */
export const USE_SAFE_SSTI = true;

const BUILTIN_TEMPLATE = `<p class="label-line">Ship to: <strong><%= login %></strong></p>
<p class="label-line">Order: <%= orderRef %></p>
<p class="label-line muted">Member shop — standard label</p>`;

const templateByLogin = new Map<string, string>();

const MAX_TEMPLATE_BYTES = 4000;

export function shippingTemplateFor(login: string): string {
  return templateByLogin.get(login) ?? BUILTIN_TEMPLATE;
}

export function saveShippingTemplate(login: string, raw: string): boolean {
  if (raw.length === 0 || raw.length > MAX_TEMPLATE_BYTES) {
    return false;
  }
  templateByLogin.set(login, raw);
  return true;
}

export function buildShippingLabelSection(login: string): string {
  const stored = shippingTemplateFor(login);
  const { html, errorMessage } = renderShippingLabel(login, stored);
  const preview = errorMessage === undefined ? html : `<p class="error">${escapeHtml(errorMessage)}</p>`;
  const fieldValue = escapeHtml(stored);
  return `<section class="shipping-label-section">
          <h2 class="shipping-label-section__title">Shipping label preview</h2>
          <p class="blurb">EJS template you save is rendered server-side with <code>login</code> and <code>orderRef</code>. SSTI lab (not HTML in bio — that was chapter 8).</p>
          <div class="shipping-label-preview">${preview}</div>
          <form class="shipping-form" method="post" action="/account/shipping">
            <div class="field">
              <label for="template">EJS template</label>
              <textarea id="template" name="template" maxlength="4000" rows="8">${fieldValue}</textarea>
            </div>
            <button class="submit submit--compact" type="submit">Render preview</button>
          </form>
        </section>`;
}

function renderShippingLabel(login: string, template: string): { html: string; errorMessage?: string } {
  const orderRef = `MS-${login}-GWTW`;
  const data = { login, orderRef };

  const source = USE_SAFE_SSTI ? BUILTIN_TEMPLATE : template;

  try {
    const html = ejs.render(source, data);
    return { html };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Template render failed";
    return { html: "", errorMessage: message };
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}