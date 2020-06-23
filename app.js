const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const ipfs = require("./ipfs");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("landing", { ok: "ok" });
});

app.post("/", async (req, res) => {
  const paste = "\n" + req.body.paste.toString("utf-8");
  console.log(paste);
  let pasteArr = Buffer.from(paste);
  console.log(pasteArr);
  try {
    const pushDetails = await ipfs.add(pasteArr);
    console.log(pushDetails);
    let ipfsHash = pushDetails[0].hash;
    res.redirect("/" + ipfsHash);
  } catch (err) {
    console.log(err.message);
  }
});

app.get("/:hash", async (req, res) => {
  const hash = req.params.hash;
  try {
    let paste = await ipfs.files.get(hash);
    console.log(paste);
    paste = new TextDecoder("utf-8").decode(paste[0].content);
    res.render("show", { paste: paste });
  } catch (err) {
    console.log(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The server has started...");
});

module.exports = app;
