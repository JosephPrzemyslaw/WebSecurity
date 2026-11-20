/** CWE-601: where to send the browser after login (`next` from query or form). */

const DEFAULT_AFTER_LOGIN = "/members";

/** Hardened after [OpenRedirect](../../OpenRedirect/) chapter 7. */
export const USE_SAFE_REDIRECT = true;

function safeRelativePath(target: string): string | undefined {
  const trimmed = target.trim();
  if (trimmed.length === 0 || !trimmed.startsWith("/")) {
    return undefined;
  }
  if (trimmed.startsWith("//")) {
    return undefined;
  }
  if (trimmed.includes("://") || trimmed.includes("\\")) {
    return undefined;
  }
  return trimmed;
}

export function resolvePostLoginRedirect(next: unknown): string {
  if (typeof next !== "string" || next.length === 0) {
    return DEFAULT_AFTER_LOGIN;
  }
  if (!USE_SAFE_REDIRECT) {
    return next;
  }
  return safeRelativePath(next) ?? DEFAULT_AFTER_LOGIN;
}