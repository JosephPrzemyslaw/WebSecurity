export function sessionCookie(sessionId: string): string {
  // SameSite=None so cross-site partner demos match Cookies exercise 5 (127.0.0.1 → localhost).
  return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return "session=; Path=/; HttpOnly; Secure; SameSite=None; Max-Age=0";
}
