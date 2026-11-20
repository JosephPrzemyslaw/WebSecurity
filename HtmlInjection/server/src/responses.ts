import type { Response } from "express";

export const HttpStatus = {
  BadRequest: 400,
  Forbidden: 403,
  NotFound: 404,
} as const;

export type HttpStatusCode = (typeof HttpStatus)[keyof typeof HttpStatus];

export function sendPlain(res: Response, status: HttpStatusCode, message: string): void {
  res.status(status).type("text/plain; charset=utf-8").send(message);
}
