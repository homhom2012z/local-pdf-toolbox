const express = require("express");
const multer = require("multer");
const { execFile } = require("child_process");
const fs = require("fs");
const path = require("path");

const app = express();
// CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});
const upload = multer({ dest: "uploads/" });

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/unlock", upload.single("pdf"), (req, res) => {
  const password = req.body.password;
  const inputPath = req.file.path;
  const outputPath = inputPath + "-unlocked.pdf";

  execFile(
    "qpdf",
    [`--password=${password}`, "--decrypt", inputPath, outputPath],
    (err) => {
      if (err) {
        console.log("Error", err);

        res
          .status(400)
          .send("Failed to unlock PDF. Wrong password or not encrypted.");
        fs.unlinkSync(inputPath);
        return;
      }
      res.download(outputPath, "unlocked.pdf", () => {
        fs.unlinkSync(inputPath);
        fs.unlinkSync(outputPath);
      });
    }
  );
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Unlock server running on port ${PORT}`));
