import type { Request, Response } from "express";

/** HTTP status codes used by mutating lab routes (extend here instead of adding sendX helpers). */
export const HttpStatus = {
  BadRequest: 400,
  Forbidden: 403,
  Conflict: 409,
  NoContent: 204,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

const defaultPlainBody: Partial<Record<HttpStatusCode, string>> = {
  [HttpStatus.BadRequest]: "Bad request",
  [HttpStatus.Forbidden]: "Forbidden",
  [HttpStatus.Conflict]: "User exists",
};

export function sendPlain(res: Response, status: HttpStatusCode, message?: string): void {
  if (status === HttpStatus.NoContent) {
    res.status(status).end();
    return;
  }
  res.status(status).type("text/plain; charset=utf-8").send(message ?? defaultPlainBody[status] ?? "");
}

/** Form submit / address bar vs &lt;img&gt; subresource (fake-inbox). */
export function prefersHtmlNavigation(req: Request): boolean {
  const dest = req.headers["sec-fetch-dest"];
  if (dest === "document") {
    return true;
  }
  if (dest === "image" || dest === "empty") {
    return false;
  }
  const accept = req.headers.accept ?? "";
  return accept.includes("text/html");
}
