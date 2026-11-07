import type { DatabaseSync } from "node:sqlite";

export function isAdminLogin(db: DatabaseSync, login: string): boolean {
  const row = db.prepare("SELECT is_admin FROM users WHERE login = ?").get(login) as
    | { is_admin: number }
    | undefined;
  return row?.is_admin === 1;
}

export type AddUserFields = {
  login: string;
  password: string;
  isAdmin: number;
};

export function parseAddUserFields(
  login: unknown,
  password: unknown,
  type: unknown,
): AddUserFields | undefined {
  if (typeof login !== "string" || typeof password !== "string" || login.trim() === "") {
    return undefined;
  }
  return {
    login: login.trim(),
    password,
    isAdmin: type === "admin" ? 1 : 0,
  };
}

export function insertUser(db: DatabaseSync, fields: AddUserFields): "created" | "exists" {
  try {
    db.prepare("INSERT INTO users (login, password, is_admin) VALUES (?, ?, ?)").run(
      fields.login,
      fields.password,
      fields.isAdmin,
    );
    return "created";
  } catch {
    return "exists";
  }
}
