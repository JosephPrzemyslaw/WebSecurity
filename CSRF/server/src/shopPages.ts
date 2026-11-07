import { readFile } from "node:fs/promises";
import type { Response } from "express";
import type { AppDeps } from "./appDeps.ts";
import { isAdminLogin } from "./users.ts";

export type ShopNavId = "members" | "account" | "team";

export function buildNav(deps: AppDeps, login: string, active: ShopNavId): string {
  const link = (href: string, label: string, id: ShopNavId) => {
    if (active === id) {
      return `<a href="${href}" aria-current="page">${label}</a>`;
    }
    return `<a href="${href}">${label}</a>`;
  };
  const parts = [link("/members", "Library", "members"), link("/account", "Your account", "account")];
  if (isAdminLogin(deps.db, login)) {
    parts.push(link("/team", "Team", "team"));
  }
  parts.push(
    `<form class="shop-nav__logout" method="POST" action="/logout"><button type="submit">Sign out</button></form>`,
  );
  return `<nav class="shop-nav" aria-label="Shop sections">${parts.join("")}</nav>`;
}

export async function sendShopPage(res: Response, filePath: string, replacements: Record<string, string>) {
  let page = await readFile(filePath, "utf8");
  for (const [needle, value] of Object.entries(replacements)) {
    page = page.replace(needle, value);
  }
  res.type("html").send(page);
}
