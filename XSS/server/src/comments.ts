/**
 * CWE-79 stored XSS: the signed-in member's opinion is written into /members.
 *
 * Exercises 1–3: leave the next line as-is (`false`).
 * Exercise 4: uncomment the line below and comment out `false` (escape before insert into HTML).
 */
const USE_SAFE_HTML = false;
// const USE_SAFE_HTML = true;

export type CommentRow = {
  author: string;
  body: string;
};

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
  // Exercises 1–3 (vulnerable): stored text is concatenated into HTML.
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
