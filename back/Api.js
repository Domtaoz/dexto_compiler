const express = require("express");
const app = express();
const compiler = require("compilex");
const fs = require("fs");
const path = require("path");
const multer = require("multer");
const options = { stats: true };
compiler.init(options);

// ตั้งค่า multer สำหรับการอัปโหลดไฟล์
const upload = multer({ dest: 'uploads/' });

app.use(express.json());

app.get("/", function (req, res) {
    console.log(__dirname); // เพิ่มคำสั่งนี้เพื่อดูตำแหน่ง
    res.sendFile(__dirname + "/index.html");
});


// API สำหรับการอัปโหลดไฟล์
app.post("/upload", upload.single("file"), function (req, res) {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    // สร้างไฟล์ใหม่จากไฟล์ที่อัปโหลด
    const uploadedFilePath = path.join(__dirname, "uploads", req.file.filename);
    fs.readFile(uploadedFilePath, "utf8", function (err, data) {
        if (err) {
            return res.status(500).json({ message: "Error reading the file" });
        }
        res.json({ content: data });
    });
});

// API สำหรับการคอมไพล์โค้ด
app.post("/compile", function (req, res) {
    console.log("Received request:", req.body);

    let { code, input, lang } = req.body;

    if (!code || !lang) {
        return res.status(400).json({ output: "Error: Missing code or language" });
    }

    try {
        let envData = { OS: "windows", options: { timeout: 10000 } };

        if (lang === "Cpp") {
            envData.cmd = "g++";
            if (!input) {
                compiler.compileCPP(envData, code, function (data) {
                    res.json(data);
                });
            } else {
                compiler.compileCPPWithInput(envData, code, input, function (data) {
                    res.json(data);
                });
            }
        }
        else if (lang === "Java") {
            const javaFilePath = './temp/JavaProgram/Main.java';
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
        }
        else if (lang === "Python") {
            if (!input) {
                compiler.compilePython(envData, code, function (data) {
                    res.json(data);
                });
            } else {
                compiler.compilePythonWithInput(envData, code, input, function (data) {
                    res.json(data);
                });
            }
        }
        else {
            res.status(400).json({ output: "Error: Unsupported language" });
        }
    } catch (e) {
        res.status(500).json({ output: "Error: Internal server error" });
    }
});

// เริ่มเซิร์ฟเวอร์
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
