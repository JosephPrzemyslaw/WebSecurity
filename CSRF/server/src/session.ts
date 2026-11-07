import { randomUUID } from "node:crypto";
import { type Request, type Response } from "express";

const session = new Map<string, string>();
const purchases = new Set<string>();

export function createSessionID(login: string): string {
  const sessionId = randomUUID();
  session.set(sessionId, login);
  return sessionId;
}

export function destroySession(sessionId: string): void {
  session.delete(sessionId);
  purchases.delete(sessionId);
}

export function currentSessionId(cookie: string | undefined): string | undefined {
  const sessionPair = cookie?.split(";").find((pair) => pair.trim().split("=")[0] === "session");
  const sessionId = sessionPair?.split("=")[1];

  if (sessionId === undefined || !session.has(sessionId)) {
    return undefined;
  }

  return sessionId;
}

export function loginForSession(sessionId: string): string | undefined {
  return session.get(sessionId);
}

export function hasPurchase(sessionId: string): boolean {
  return purchases.has(sessionId);
}

export function recordPurchase(sessionId: string): void {
  purchases.add(sessionId);
}

export default function isSession(cookie: string | undefined) {
  return currentSessionId(cookie) !== undefined;
}

export function redirectToMembersIfSession(req: Request, res: Response, next: () => void) {
  if (isSession(req.get("cookie"))) {
    res.redirect("/members");
    return;
  }
  next();
}

export function redirectToLoginIfNoSession(req: Request, res: Response, next: () => void) {
  const sessionId = currentSessionId(req.get("cookie"));
  if (sessionId === undefined) {
    res.redirect("/login");
    return;
  }
  res.locals.sessionId = sessionId;
  next();
}

/* Exercise 1–3 — OWASP A01 — CWE-352: uncomment this entire block, then uncomment matching blocks in routes/*.ts and forms.ts
const csrfBySessionId = new Map<string, string>();

export function issueCsrfToken(sessionId: string): string {
  const token = randomUUID();
  csrfBySessionId.set(sessionId, token);
  return token;
}

export function csrfTokenFor(sessionId: string): string | undefined {
  return csrfBySessionId.get(sessionId);
}

export function clearCsrfToken(sessionId: string): void {
  csrfBySessionId.delete(sessionId);
}

export function csrfTokenValid(sessionId: string, submitted: unknown): boolean {
  const expected = csrfBySessionId.get(sessionId);
  return typeof submitted === "string" && submitted.length > 0 && submitted === expected;
}
*/
