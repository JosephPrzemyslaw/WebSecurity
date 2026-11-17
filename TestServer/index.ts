import express from "express";
const app = express();
app.post("/key", express.text(), (req, res) => {
  if (typeof req.body === "string" && req.body !== "") console.log(req.body);
  res.end();
});
app.listen(4000);