const express = require("express");
const app = express();
const compiler = require("compilex");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const options = { stats: true };
compiler.init(options);

app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get("/", function (req, res) {
    compiler.flush(function () {
        console.log("deleted");
    });
    res.sendFile(__dirname + "/index.html");
});

app.post('/upload', upload.single('file'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ output: "No file uploaded" });
    }

    const uploadedFilePath = path.join(__dirname, 'uploads', req.file.originalname);
    fs.rename(req.file.path, uploadedFilePath, function (err) {
        if (err) {
            return res.status(500).json({ output: "Error while saving file" });
        }
        res.json({ output: "File uploaded successfully", filePath: uploadedFilePath });
    });
});

app.post("/save", function (req, res) {
    const { filename, code } = req.body;
    if (!filename || !code) {
        return res.status(400).json({ output: "Missing filename or code" });
    }
    const filePath = path.join(__dirname, 'uploads', filename);
    fs.writeFileSync(filePath, code);
    res.json({ output: "File saved successfully", filePath });
});

app.post("/compile", function (req, res) {
    let { code, input, lang } = req.body;
    if (!code || !lang) {
        return res.status(400).json({ output: "Missing code or language" });
    }
    try {
        let envData = { OS: "windows", options: { timeout: 10000 } };
        if (lang === "Cpp") {
            envData.cmd = "g++";
            compiler.compileCPP(envData, code, function (data) {
                res.json(data);
            });
        } else if (lang === "Python") {
            compiler.compilePythonWithInput(envData, code, input, function (data) {
                res.json(data);
            });
        } else {
            res.status(400).json({ output: "Unsupported language" });
        }
    } catch (e) {
        res.status(500).json({ output: "Internal server error" });
    }
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
