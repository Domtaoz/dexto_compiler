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

// อัปโหลดไฟล์
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ output: "No file uploaded" });
    }
    const uploadedFilePath = path.join(__dirname, "uploads", req.file.originalname);
    fs.rename(req.file.path, uploadedFilePath, (err) => {
        if (err) {
            return res.status(500).json({ output: "Error while saving file" });
        }
        fs.readFile(uploadedFilePath, "utf8", (err, data) => {
            if (err) {
                return res.status(500).json({ output: "Error reading file" });
            }
            res.json({ output: "File uploaded successfully", filePath: uploadedFilePath, content: data });
        });
    });
});

// บันทึกโค้ด
app.post("/save", (req, res) => {
    const { filename, code, isExisting } = req.body;
    if (!filename || !code) {
        return res.status(400).json({ output: "Missing filename or code" });
    }
    const filePath = path.join(__dirname, "uploads", filename);
    fs.writeFileSync(filePath, code);
    res.json({ output: isExisting ? "File updated successfully" : "File saved successfully", filePath });
});

// คอมไพล์โค้ด
app.post("/compile", (req, res) => {
    let { code, input, lang } = req.body;
    if (!code || !lang) {
        return res.status(400).json({ output: "Missing code or language" });
    }

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

// ดาวน์โหลดไฟล์
app.get("/download/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "uploads", filename);

    // ตรวจสอบว่ามีไฟล์นั้นในเซิร์ฟเวอร์หรือไม่
    fs.access(filePath, fs.constants.F_OK, (err) => {
        if (err) {
            return res.status(404).json({ output: "File not found" });
        }

        // ส่งไฟล์ให้ผู้ใช้ดาวน์โหลด
        res.download(filePath, filename, (err) => {
            if (err) {
                res.status(500).json({ output: "Error downloading file" });
            }
        });
    });
});

app.listen(8000, () => console.log("Server running on http://localhost:8000"));
