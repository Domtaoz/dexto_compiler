const express = require("express"); 
const app = express();
const compiler = require("compilex");
const options = { stats: true };

compiler.init(options);

// ใช้ express.json() แทน body-parser
app.use(express.json()); 

// เสิร์ฟไฟล์จาก codemirror
app.use("/codemirror-5.65.9", express.static(__dirname + "/codemirror-5.65.9"));

// เสิร์ฟหน้า HTML
app.get("/", function (req, res) {
    compiler.flush(function () {
        console.log("deleted");
    });
    res.sendFile(__dirname + "/index.html");
});

// API สำหรับการคอมไพล์โค้ด
app.post("/compile", function (req, res) {
    console.log("Received request:", req.body); // Debug เพื่อดูข้อมูลที่ได้รับ

    let { code, input, lang } = req.body;

    if (!code || !lang) {
        return res.status(400).json({ output: "Error: Missing code or language" });
    }

    try {
        let envData = { OS: "windows", options: { timeout: 10000 } };
        
        // สำหรับ C++
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
        // สำหรับ Java
        else if (lang === "Java") {
            if (!input) {
                compiler.compileJava(envData, code, function (data) {
                    res.json(data);
                });
            } else {
                compiler.compileJavaWithInput(envData, code, input, function (data) {
                    res.json(data);
                });
            }
        }
        // สำหรับ Python
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
        console.error("Compilation error:", e);
        res.status(500).json({ output: "Error: Internal server error" });
    }
});

// เริ่มเซิร์ฟเวอร์
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
