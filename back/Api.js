const express = require("express");
const app = express();
const compiler = require("compilex");
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const upload = multer({ dest: 'uploads/' });

const options = { stats: true };
compiler.init(options);

// ใช้ express.json() แทน body-parser
app.use(express.json());
app.use(express.static(__dirname + "/public"));  // เสิร์ฟไฟล์ HTML

app.get("/", function (req, res) {
    compiler.flush(function () {
        console.log("deleted");
    });
    res.sendFile(__dirname + "/index.html");  // เสิร์ฟไฟล์ index.html
});


// Route สำหรับการอัปโหลดไฟล์
app.post('/upload', upload.single('file'), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ output: "No file uploaded" });
    }

    const uploadedFilePath = path.join(__dirname, 'uploads', req.file.filename);
    fs.rename(req.file.path, uploadedFilePath, function (err) {
        if (err) {
            return res.status(500).json({ output: "Error while saving file" });
        }
        res.json({ output: "File uploaded successfully", filePath: uploadedFilePath });
    });
});

// API สำหรับการคอมไพล์โค้ด
app.post("/compile", function (req, res) {
    let { code, input, lang } = req.body;

    if (!code || !lang) {
        return res.status(400).json({ output: "Error: Missing code or language" });
    }

    try {
        let envData = { OS: "windows", options: { timeout: 10000 } };

        if (lang === "Cpp") {
            envData.cmd = "g++";
            compiler.compileCPP(envData, code, function (data) {
                res.json(data);
            });
        } else if (lang === "Java") {
            let javaFilePath = './temp/JavaProgram/Main.java';
            fs.writeFileSync(javaFilePath, code);
            const exec = require('child_process').exec;

            exec(`javac ${javaFilePath}`, (err, stdout, stderr) => {
                if (err || stderr) {
                    return res.status(500).json({ output: stderr || "Error: Compilation failed" });
                }

                exec(`java -cp ./temp/JavaProgram Main ${input}`, (err, stdout, stderr) => {
                    if (err || stderr) {
                        return res.status(500).json({ output: stderr || "Error: Execution failed" });
                    }
                    res.json({ output: stdout });
                });
            });
        } else if (lang === "Python") {
            compiler.compilePythonWithInput(envData, code, input, function (data) {
                res.json(data);
            });
        } else {
            res.status(400).json({ output: "Error: Unsupported language" });
        }
    } catch (e) {
        res.status(500).json({ output: "Error: Internal server error" });
    }
});

// เริ่มเซิร์ฟเวอร์
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
