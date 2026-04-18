import { useState } from "react";
import axios from "axios";
import { FaPlus } from "react-icons/fa";
const handleUpload = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  try {
    await axios.post(
      "http://localhost:8000/upload/",
      formData
    );

    alert("PDF uploaded successfully!");
  } catch (err) {
    console.log("ERROR:", err.response?.data);
    alert(err.response?.data?.detail || "Upload failed");
  }
};
export default function ChatBox() {
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!msg) return;

    const userMessage = msg;
    setChat([...chat, { type: "user", text: userMessage }]);
    setMsg("");
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8000/chat/", {
        message: userMessage,
      });

      setChat((prev) => [
        ...prev,
        { type: "ai", text: res.data.response },
      ]);
    } catch (err) {
      setChat((prev) => [
        ...prev,
        { type: "ai", text: "Error getting response" },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-6">

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">

        {chat.map((c, i) => (
          <div
            key={i}
            className={`flex ${
              c.type === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md px-4 py-2 rounded-2xl shadow ${
                c.type === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              {c.text}
            </div>
          </div>
        ))}

        {/* Typing Loader */}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-2 rounded-2xl shadow text-gray-500">
              AI is typing...
            </div>
          </div>
        )}

      </div>

      {/* Input Box */}
      <div className="bg-white p-4 rounded-2xl shadow flex items-center">

        <input
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          className="flex-1 outline-none"
          placeholder="Ask any research question..."
        />

        {/* Upload */}
        <label className="cursor-pointer mx-2">
          <FaPlus />
          <input
  type="file"
  className="hidden"
  accept=".pdf"
  onChange={(e) => {
    console.log("File selected:", e.target.files[0]);  // 👈 debug
    handleUpload(e.target.files[0]);
  }}
/>
        </label>

        {/* Send */}
        <button
          onClick={send}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
        >
          ➤
        </button>

      </div>
    </div>
  );
}