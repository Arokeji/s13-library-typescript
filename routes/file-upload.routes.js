const express = require("express");
const multer = require("multer");
const fs = require("fs");

const router = express.Router();

const upload = multer({ dest: "public" });

router.post("/", upload.single("file"), (req, res, next) => {
  try {
    const originalName = req.file.originalname;
    const path = req.file.path;

    const newPath = `${path}_${originalName}`;

    // Asigna a la propiedad path el valor de newPath
    fs.renameSync(path, newPath);

    res.send("✅ File uploaded succesfully.");
    console.log("✅ File uploaded succesfully.");
  } catch (error) {
    next(error);
  }
});

module.exports = { fileUploadRouter: router };
