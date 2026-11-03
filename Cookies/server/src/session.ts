import { type Request, type Response } from "express";

const session = new Map<string, string>();
const purchases = new Set<string>();

export function createSessionID(login:string): string {
    // INCORRECT (exercise 1): session id equals login — easy to guess/reuse.
    // OWASP Top 10:2025 — A04 Cryptographic Failures (mapped CWE-330, CWE-340).
    const sessionId = login;
    session.set(sessionId, login);

    return sessionId;
}

export function currentSessionId(cookie: string | undefined): string | undefined {
    const sessionPair = cookie?.split(";").find(pair => pair.trim().split("=")[0] === "session");
    const sessionId = sessionPair?.split("=")[1];

    // INCORRECT (exercise 2): only checks that a session cookie exists, not that the
    // value was issued by this server. OWASP Top 10:2025 — A07 Authentication Failures
    // (missing server-side session validation). OWASP A07 — CWE-287 (Top 10 mapped).
    // CWE-565 related but not on Top 10:2025 category lists.
    if (sessionId === undefined) { // || !session.has(sessionId)) {
        return undefined;
    }

    return sessionId;
}

export function hasPurchase(sessionId: string): boolean {
    return purchases.has(sessionId);
}

export function recordPurchase(sessionId: string): void {
    purchases.add(sessionId);
}

export default function isSession(cookie:string | undefined) {
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
