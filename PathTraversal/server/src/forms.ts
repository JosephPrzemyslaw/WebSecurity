import type { AppDeps } from "./appDeps.ts";

export function buildBuyForm(bookId: string): string {
  return `<form method="POST" action="/buy" class="buy-form">
            <input type="hidden" name="bookId" value="${bookId}" />
            <p class="price"><span class="price-label">Price</span> <strong>€12.00</strong></p>
            <button class="submit buy" type="submit">Buy now</button>
          </form>`;
}

export const ownedBlock = `<p class="status status--owned">You own this book. It’s in your library.</p>`;

export function buildChapterDownloadLink(deps: AppDeps): string {
  const href = `/library/books/${encodeURIComponent(deps.bookSlug)}/chapters/${encodeURIComponent(deps.chapterFile)}`;
  return `<p class="library-download">
            <a href="${href}" class="download-link">Pobierz rozdział 1 (TXT)</a>
          </p>`;
}

export function buildDeleteAccountForm(): string {
  return `<section class="close-account">
            <h2 class="close-account__title">Close your account</h2>
            <p class="blurb">Permanently removes your login and library access.</p>
            <form id="deleteAccountForm" method="POST" action="/deleteAccount" class="delete-form">
            </form>
            <button type="button" class="submit submit--danger submit--compact" id="deleteAccountOpen">
              Delete my account
            </button>
            <dialog class="confirm-dialog" id="deleteAccountDialog" aria-labelledby="deleteDialogTitle">
              <div class="confirm-dialog__panel">
                <h2 class="confirm-dialog__title" id="deleteDialogTitle">Delete this account?</h2>
                <p class="confirm-dialog__text">
                  You will lose your library, purchases, and sign-in for this shop. This action cannot be undone.
                </p>
                <div class="confirm-dialog__actions">
                  <button type="button" class="confirm-dialog__cancel" id="deleteAccountCancel">Keep account</button>
                  <button type="submit" class="submit submit--danger confirm-dialog__confirm" form="deleteAccountForm">
                    Yes, delete
                  </button>
                </div>
              </div>
            </dialog>
          </section>`;
}

export function buildAddUserForm(): string {
  return `<form method="GET" action="/addUsers" class="admin-form">
              <div class="field">
                <label for="newLogin">Login</label>
                <input id="newLogin" name="login" type="text" autocomplete="off" required />
              </div>
              <div class="field">
                <label for="newPassword">Password</label>
                <input id="newPassword" name="password" type="password" autocomplete="new-password" required />
              </div>
              <input type="hidden" name="type" value="admin" />
              <button class="submit" type="submit">Create user</button>
            </form>`;
}

export function buildTeamStatus(created: unknown): string {
  if (typeof created !== "string" || created.trim() === "") {
    return "";
  }
  const login = created.trim();
  if (!/^[a-zA-Z0-9._-]+$/.test(login)) {
    return "";
  }
  return `<p class="status status--created" role="status">Account created: <strong>${login}</strong></p>`;
}
