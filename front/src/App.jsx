import React, { useState } from "react";

const App = () => {
  const [fileContent, setFileContent] = useState("");
  const [fileExtension, setFileExtension] = useState("");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");

  const handleFileUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target.result);
        setFileExtension(file.name.split(".").pop());
      };
      reader.readAsText(file);
    }
  };

  const handleCompile = async () => {
    try {
      const response = await fetch("http://localhost:5000/compile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: fileContent,
          extension: fileExtension,
          input: input,
        }),
      });

      const result = await response.json();
      setOutput(result.output || result.error);
    } catch (error) {
      setOutput("Error: " + error.message);
    }
  };

  const handleSave = async () => {
    try {
      console.log("Sending save request...");
  
      const response = await fetch("http://localhost:5000/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filename: `edited_file.${fileExtension}`,
          content: fileContent,
        }),
      });
  
      console.log("Response received:", response);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const result = await response.json();
      alert(result.message);
    } catch (error) {
      console.error("Save error:", error);
      alert("Error: " + error.message);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <h1 className="text-xl font-bold mb-4 text-center">📂 อัปโหลดและแก้ไขโค้ด</h1>
        <input
          type="file"
          accept=".py,.cpp,.java,.txt"
          onChange={handleFileUpload}
          className="border p-2 rounded w-full"
        />
        {fileContent && (
          <div className="mt-4 p-4 bg-gray-200 rounded">
            <h2 className="font-semibold">📄 เนื้อหาไฟล์:</h2>
            <pre className="w-full h-40 p-2 border rounded bg-white whitespace-pre-wrap">{fileContent}</pre>
          </div>
        )}
        {fileContent && (
          <textarea
            className="w-full h-40 p-2 border rounded mt-2"
            value={fileContent}
            onChange={(e) => setFileContent(e.target.value)}
          />
        )}
        <h3 className="mt-4 font-semibold">📤 ผลลัพธ์ & 🔢 ป้อนค่า Input:</h3>
        <textarea
          className="w-full h-20 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <textarea
          className="w-full h-20 p-2 border rounded mt-2"
          value={output}
          readOnly
        />
        <button
          onClick={handleCompile}
          className="mt-4 bg-blue-500 text-white p-2 rounded w-full"
        >
          คอมไพล์และรันโค้ด
        </button>
        <button
          onClick={handleSave}
          className="mt-4 bg-green-500 text-white p-2 rounded w-full"
        >
          💾 บันทึกไฟล์
        </button>
      </div>
    </div>
  );
};

export default App;
