import { join } from "node:path";
import express, { type Express } from "express";
import { createAppDeps } from "./appDeps.ts";
import { prepareDatabase } from "./db.ts";
import { registerAccountRoutes } from "./routes/account.ts";
import { registerAuthRoutes } from "./routes/auth.ts";
import { registerLibraryRoutes } from "./routes/library.ts";
import { registerMembersRoutes } from "./routes/members.ts";
import { registerTeamRoutes } from "./routes/team.ts";

const port = 3004;
const db = await prepareDatabase();
const app: Express = express();
const publicDir = join(import.meta.dirname, "..", "public");
const deps = createAppDeps(db, import.meta.dirname);

app.use(express.urlencoded({ extended: false }));

registerAuthRoutes(app, deps);
registerMembersRoutes(app, deps);
registerAccountRoutes(app, deps);
registerTeamRoutes(app, deps);
registerLibraryRoutes(app, deps);

app.use(express.static(publicDir));

app.listen(port, (error?: Error) => {
  if (error) {
    console.error(error.message);
    process.exit(1);
  }

  console.log(`Path traversal lab (member shop) is running on http://localhost:${port}`);
});
