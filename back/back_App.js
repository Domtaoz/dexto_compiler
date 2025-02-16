// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors'); // ✅ เพิ่ม CORS
// const { exec } = require('child_process');
// const fs = require('fs');
// const path = require('path');
// const os = require('os');

// const app = express();
// const port = 5000;

// app.use(bodyParser.json());
// app.use(cors()); // ✅ เปิดใช้งาน CORS

// // ✅ เส้นทางทดสอบว่า backend ทำงานอยู่
// app.get("/", (req, res) => {
//   res.send("Backend is running!");
// });

// // ✅ Endpoint สำหรับคอมไพล์โค้ด
// app.post('/compile', (req, res) => {
//   const { code, extension } = req.body;

//   if (!code || !extension) {
//     return res.status(400).json({ error: 'No code or file extension provided' });
//   }

//   let tempFilePath = "";
//   let command = "";

//   if (extension === "py") {
//     tempFilePath = path.join(__dirname, 'tempCode.py');
//     fs.writeFileSync(tempFilePath, code);
//     command = `python3 ${tempFilePath}`;
//   } else if (extension === "cpp") {
//     tempFilePath = path.join(__dirname, 'tempCode.cpp');
//     fs.writeFileSync(tempFilePath, code);
    
//     // ✅ ตรวจสอบว่าเป็น Windows หรือ Linux
//     if (os.platform() === "win32") {
//       command = `g++ ${tempFilePath} -o tempCode.exe && tempCode.exe`;
//     } else {
//       command = `g++ ${tempFilePath} -o tempCode && ./tempCode`;
//     }
//   } else {
//     return res.status(400).json({ error: 'Unsupported file type' });
//   }

//   exec(command, (err, stdout, stderr) => {
//     if (err) {
//       return res.status(500).json({ error: stderr || "Compilation error" });
//     }
//     return res.json({ output: stdout });
//   });
// });

// // ✅ รันเซิร์ฟเวอร์
// app.listen(port, () => {
//   console.log(`Server running on http://localhost:${port}`);
// });





const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.post("/compile", (req, res) => {
  const { code, extension, input } = req.body;
  if (!code || !extension) {
    return res.status(400).json({ error: "No code or file extension provided" });
  }

  let tempFilePath = "";
  let command = "";

  if (extension === "py") {
    tempFilePath = path.join(__dirname, "tempCode.py");
    fs.writeFileSync(tempFilePath, code);
    command = `echo "${input}" | python3 ${tempFilePath}`;
  } else if (extension === "cpp") {
    tempFilePath = path.join(__dirname, "tempCode.cpp");
    fs.writeFileSync(tempFilePath, code);
    command = `g++ ${tempFilePath} -o tempCode && echo "${input}" | ./tempCode`;
  } else if (extension === "java") {
    tempFilePath = path.join(__dirname, "TempCode.java");
    fs.writeFileSync(tempFilePath, code);
    command = `javac ${tempFilePath} && echo "${input}" | java TempCode`;
  } else if (extension === "txt") {
    tempFilePath = path.join(__dirname, "tempFile.txt");
    fs.writeFileSync(tempFilePath, code);
    return res.json({ output: "📄 ไฟล์ .txt ถูกบันทึกเรียบร้อย!" });
  } else {
    return res.status(400).json({ error: "Unsupported file type" });
  }

  exec(command, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: stderr || "Compilation error" });
    }
    return res.json({ output: stdout });
  });
});

app.post("/save", (req, res) => {
  const { filename, content } = req.body;
  if (!filename || !content) {
    return res.status(400).json({ error: "Filename and content required" });
  }

  const filePath = path.join(__dirname, filename);
  fs.writeFileSync(filePath, content);
  res.json({ message: "📂 ไฟล์ถูกบันทึกเรียบร้อย!" });
});

app.get("/download", (req, res) => {
  const { filename } = req.query;
  if (!filename) {
    return res.status(400).json({ error: "Filename required" });
  }

  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: "File not found" });
  }

  res.download(filePath);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
