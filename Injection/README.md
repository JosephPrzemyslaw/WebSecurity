# SQL Injection

This folder is the SQL injection lab: a login form whose query is built from user input.

`GET /login` reads `login` and `password` from the query string and pastes them into the SQL text in `server/src/index.ts`. Fix that with a parameterized query (`?` placeholders) so those values stay data.

The app is already in this folder. Install dependencies and start the server.

- **Frontend:** HTML + vanilla JavaScript, served by Express from `server/public/`
- **Backend:** Node.js + Express + TypeScript
- **Database:** in-memory SQLite (`node:sqlite`, `:memory:`). Schema and users are in `server/sql/init.sql`. Each `npm run dev` loads a fresh database.

Application logic on the server is TypeScript (`.ts`). The browser files are HTML, CSS, and JavaScript.

## Supported platforms

macOS, Windows, and Ubuntu.

- Start the app with `npm run dev` (`node --watch src/index.ts`).
- SQLite uses Node’s `node:sqlite` (`DatabaseSync` on Node 26.5). Not `better-sqlite3`.
- On Windows use PowerShell or the editor terminal.



## Prerequisites

1. **Node.js 22+** (includes npm): [https://nodejs.org](https://nodejs.org). This lab is written for Node 26.5 (`DatabaseSync`).
2. A terminal and a browser

```bash
node -v
npm -v
```



## Project layout (already in git)

```text
Injection/
  README.md
  server/
    src/index.ts
    src/db.ts
    sql/init.sql
    public/
      index.html      # sign-in form
      login.js        # shows the sentence for ?error=invalid or ?error=server
      members.html
      style.css
```



## Run

```bash
cd server
npm install
npm run dev
```

Open `http://localhost:3000`. Sign in as `ewa` / `ewa123` or `marc` / `marc123` (passwords stored as plain text for now).

The form is `method="GET"` and `action="/login"`, so the browser puts `login` and `password` in the URL. A match redirects to `/members.html`. A rejected sign-in redirects to `/?error=invalid`.

Passwords in `sql/init.sql` are plain text. Restarting the server rebuilds the in-memory database from that file.

## SQL injection



### 1. Credentials out of the URL

The sign-in form uses `GET`, so the browser puts `login` and `password` in the address bar.

Change the form so those fields travel in the request body instead (`method="POST"`). A browser form POST sends `application/x-www-form-urlencoded`. Express does not parse that by default, so `req.body` stays empty until you add the form parser before the login route:

```ts
app.use(express.urlencoded({ extended: false }));
```

Then switch `GET /login` to `POST /login` and read `login` and `password` from `req.body`, not from `req.query`. A rejected sign-in should still redirect to `/?error=invalid`. The password should not appear in that address.

Hint: `[express.urlencoded()](https://expressjs.com/en/5x/api.html#express.urlencoded)` is the form body parser. `extended: false` is enough for a simple `login` and `password` pair.

### 2. Check presence of SQL injection

Sign in with login `ewa` and password `nope`. The page says `Invalid login or password`.

Sign in again with `'` in the **login** field. The password can be anything. The page shows `Error:` and a list of files. One line is the path to `index.ts` on the server.

A wrong password and a quote do not end the same way. The quote broke the query. That is the sign of SQL injection.

### 3. Hide the stack

That list of files should not be on the page.

Open `server/src/index.ts`. Find `app.get("/login"`. Replace this block:

```ts
  const query = `SELECT login, password FROM users WHERE login = '${login}' AND password = '${password}'`;
  const user = db
    .prepare(query)
    .get() as { login: string; password: string } | undefined;

  if (user === undefined) {
    res.redirect("/?error=invalid");
    return;
  }

  res.redirect("/members.html");
```

with this block, in the same place:

```ts
  try {
    const query = `SELECT login, password FROM users WHERE login = '${login}' AND password = '${password}'`;
    const user = db
      .prepare(query)
      .get() as { login: string; password: string } | undefined;

    if (user === undefined) {
      res.redirect("/?error=invalid");
      return;
    }

    res.redirect("/members.html");
  } catch (error) {
    res.redirect("/?error=server");
    return;
  }
```

Save the file. Wait until the terminal prints `Server is running on http://localhost:3000`. Sign in with `'` in the **login** field again.

The page says `Something went wrong. Try again.` The list of files is gone.

### 4. Bypass login section using SQL Injection

The handler pastes the login field into the statement:

```sql
WHERE login = '${login}' AND password = '${password}'
```

Type the sample in the **login** field. The password can be anything; that check is commented out.

**A.** You know the login (`ewa`) but not the password. Enter `ewa' --`.

The quote closes the login string and `--` comments out the rest, so the statement that runs is `WHERE login = 'ewa'`.

**B.** You do not know a valid login or password. Enter `' OR 1=1--`.

The statement that runs is `WHERE login = '' OR 1=1`. `1=1` is always true, so the query returns a row and you are signed in. 

### 5. SQL injection fix

`POST /login` still pastes `login` and `password` into the SQL text:

```ts
const query = `SELECT login, password FROM users WHERE login = '${login}' AND password = '${password}'`;
const user = db.prepare(query).get() as { login: string; password: string } | undefined;
```

Keep the same statement. Put `?` where the values were (no quotes around `?`) and pass them to `.get()` in that order. SQLite then treats them as data.

```ts
const query = `SELECT login, password FROM users WHERE login = ? AND password = ?`;
const user = db.prepare(query).get(login, password) as { login: string; password: string } | undefined;
```

Hint: [Binding parameters](https://nodejs.org/api/sqlite.html#binding-parameters) in the Node.js `node:sqlite` documentation.
