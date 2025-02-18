const express = require("express");
const app = express();
const compiler = require("compilex");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const upload = multer({ dest: "uploads/" });

const options = { stats: true };
compiler.init(options);

app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
    compiler.flush(() => console.log("Deleted temporary files"));
    res.sendFile(__dirname + "/index.html");
});

// ดึงไฟล์จากเครื่องมาแก้ไข
app.post("/load-file", upload.single("file"), (req, res) => {
    if (!req.file) return res.status(400).json({ output: "No file uploaded" });

    const filePath = path.join(__dirname, req.file.path);
    fs.readFile(filePath, "utf8", (err, data) => {
        if (err) return res.status(500).json({ output: "Error reading file" });

        res.json({ filename: req.file.originalname, content: data });
    });
});

// บันทึกไฟล์ลงเครื่อง
app.post("/save", (req, res) => {
    const { filename, code } = req.body;
    if (!filename || !code) return res.status(400).json({ output: "Missing filename or code" });

    const filePath = path.join(__dirname, "uploads", filename);
    fs.writeFileSync(filePath, code);
    res.json({ output: "File saved successfully", filePath });
});

// คอมไพล์โค้ด
app.post("/compile", (req, res) => {
    let { code, input, lang } = req.body;
    if (!code || !lang) return res.status(400).json({ output: "Missing code or language" });

    try {
        let envData = { OS: "windows", options: { timeout: 10000 } };

        if (lang === "Cpp") {
            envData.cmd = "g++";
            compiler.compileCPPWithInput(envData, code, input, (data) => res.json(data));

        } else if (lang === "Python") {
            compiler.compilePythonWithInput(envData, code, input, (data) => res.json(data));

        } else if (lang === "Java") {
            compiler.compileJavaWithInput(envData, code, input, (data) => res.json(data));

        } else {
            res.status(400).json({ output: "Unsupported language" });
        }
    } catch (e) {
        res.status(500).json({ output: "Internal server error" });
    }
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
