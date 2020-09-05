const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const downloadsFolder = require("downloads-folder");
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
    res.render("show", { paste: paste, key: hash });
  } catch (err) {
    console.log(err.message);
  }
});

// //not needed anymore
// app.post("/download", (req, res) => {
//   const data = req.body.raw_paste.toString("utf-8");
//   const key = req.body.key.toString("utf-8");
//   console.log(data);

//   var writeStream = fs.createWriteStream("pastebin.txt");
//   writeStream.write(data);
//   writeStream.end();
//   res.redirect("/"+key);
// });

app.get("/:hash/download", async (req, res) => {

  try {
    //decode content
    let paste = await ipfs.files.get(req.params.hash);
    paste = new TextDecoder("utf-8").decode(paste[0].content);
    //create/link to file pastebin.txt
    var writeStream = await fs.createWriteStream("pastebin.txt");
    //write paste into file
    writeStream.write(paste, 'utf8', () => {
      //no need to delete file since it will just overwrite again and again
      res.download("./pastebin.txt")
    });
  } catch (err) {
    console.log(err.message);
  }

});



const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("The server has started...");
});

module.exports = app;
