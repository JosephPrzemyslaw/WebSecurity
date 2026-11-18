import { filterCatalog, CATALOG, type CatalogBook } from "./catalog.ts";

/**
 * CWE-79: opinions on /members (stored) and library search `q` on /members (reflected).
 *
 * Exercises 1–5: leave the next line as-is (`false`).
 * Exercise 6: uncomment the line below and comment out `false` (escape before insert into HTML).
 */

const USE_SAFE_HTML = false;
// const USE_SAFE_HTML = true;

export type CommentRow = {
  author: string;
  body: string;
};

export function buildLibraryCatalog(
  query: string | undefined,
  buySection: string,
  downloadSection: string,
): string {
  const searching = query !== undefined;
  const books = searching ? filterCatalog(query) : CATALOG;
  let html = "";

  if (searching) {
    const term = textForPage(query.trim());
    html += `<p class="search-results">Showing results for: ${term}</p>`;
    html += `<p class="search-clear-row"><a class="search-clear" href="/members">Clear search</a></p>`;
    if (books.length === 0) {
      html += `<p class="search-empty">No titles matched. Try another author or keyword.</p>`;
    }
  } else {
    html += `<h2 class="catalog-heading">Catalog</h2>`;
    html += `<p class="catalog-intro">Six classics in the member shop. Only <strong>Gone with the Wind</strong> is on sale today.</p>`;
  }

  if (books.length > 0) {
    html += `<ul class="catalog-list">\n`;
    html += books.map((book) => catalogItemHtml(book, buySection, downloadSection)).join("\n");
    html += `</ul>`;
  }
  return html;
}

function catalogItemHtml(book: CatalogBook, buySection: string, downloadSection: string): string {
  const tagClass = book.shopTitle ? "article-tag" : "article-tag article-tag--muted";
  const tagLabel = book.shopTitle ? "On sale" : "Catalog listing";
  const coverInner = book.coverSrc
    ? `<img src="${book.coverSrc}" alt="" />`
    : `<span class="catalog-cover__initial">${book.coverInitials}</span>`;
  const shopBlock = book.shopTitle
    ? `<div class="catalog-item__shop">\n            ${downloadSection}\n            ${buySection}\n          </div>`
    : `<p class="catalog-note">Not sold in this shop.</p>`;
  return `<li>
      <article class="catalog-item">
        <div class="catalog-cover" style="--cover-accent: ${book.coverAccent}">
          ${coverInner}
        </div>
        <div class="catalog-item__body">
          <p class="${tagClass}">${tagLabel}</p>
          <h2>${book.title}</h2>
          <p class="byline">${book.author}</p>
          <p class="blurb">${book.blurb}</p>
          ${shopBlock}
        </div>
      </article>
    </li>`;
}

export function buildCommentList(rows: CommentRow[]): string {
  if (rows.length === 0) {
    return `<p class="empty">No opinions yet.</p>`;
  }
  return rows.map((row) => commentHtml(row.author, row.body)).join("\n");
}

function commentHtml(author: string, body: string): string {
  const name = textForPage(author);
  const opinion = textForPage(body);
  return `<article class="comment">
  <p class="comment-author">${name}</p>
  <div class="comment-body">${opinion}</div>
</article>`;
}

function textForPage(value: string): string {
  if (USE_SAFE_HTML) {
    return escapeHtml(value);
  }
  // Exercises 1–5 (vulnerable): text is concatenated into HTML.
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
