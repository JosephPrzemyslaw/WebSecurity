export function sessionCookie(sessionId: string): string {
  return `session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict`;
}

export function clearSessionCookie(): string {
  return "session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0";
}
