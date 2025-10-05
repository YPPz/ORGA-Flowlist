import { useState, useRef, useEffect } from "react";
import { useEvents } from "../contexts/EventContext.js";
import { sendMessageToAI } from "../api/ai.js";
import { getEvents } from "../api/event.js";
import { useUser } from "../contexts/UserContext.js";

export default function Assistant() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const { setEvents } = useEvents();
  const messagesEndRef = useRef(null);
  const toggleChat = () => setOpen(!open);
  const { user } = useUser();

  // โหลดข้อความเก่าของ user ปัจจุบัน
  useEffect(() => {
    const saved = localStorage.getItem("assistantMessages");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const userMessages = parsed.filter(m => m.user_id === user.user_id);
        setMessages(userMessages);
      } catch (err) {
        console.error("Failed to parse saved messages:", err);
      }
    }
  }, [user.user_id]);

  // เซฟ messages ทั้งหมด (ทุก user) แต่ filter ให้เก็บทุก user ด้วย
  useEffect(() => {
    if (messages.length === 0) return;

    const saved = localStorage.getItem("assistantMessages");
    let allMessages = [];
    if (saved) {
      try {
        allMessages = JSON.parse(saved).filter(m => m.user_id !== user.user_id);
      } catch { }
    }
    const combined = [...allMessages, ...messages];
    localStorage.setItem("assistantMessages", JSON.stringify(combined));
  }, [messages, user.user_id]);

  // ล้างแชทของ user ปัจจุบัน
  const clearChat = () => {
    const saved = localStorage.getItem("assistantMessages");
    let allMessages = [];
    if (saved) {
      try {
        allMessages = JSON.parse(saved).filter(m => m.user_id !== user.user_id);
      } catch { }
    }
    localStorage.setItem("assistantMessages", JSON.stringify(allMessages));
    setMessages([]);
  };

  // scroll แชทลงท้ายอัตโนมัติ
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestampId = Date.now();
    const userMessage = {
      role: "user",
      text: input,
      user_id: user.user_id,
      id: timestampId,
    };
    const typingId = `ai-typing-${timestampId}`;

    // เพิ่ม user message + typing
    setMessages(prev => [
      ...prev,
      userMessage,
      { role: "ai", text: "กำลังพิมพ์...", id: typingId, user_id: user.user_id },
    ]);
    setInput("");

    try {
      // ส่งเฉพาะข้อความของ user ปัจจุบันไปให้ AI
      const response = await sendMessageToAI(
        messages.filter(m => m.user_id === user.user_id).concat(userMessage)
      );

      // เอา "กำลังพิมพ์..." ออก + ใส่ข้อความตอบกลับ
      if (response?.summary) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { role: "ai", text: response.summary, user_id: user.user_id },
        ]);

        // ถ้า backend บอกว่ามี CRUD สำเร็จ → reload events
        if (response.results?.some(r => r.success)) {
          const refreshed = await getEvents();
          setEvents(refreshed);
        }
      } else {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { role: "ai", text: JSON.stringify(response), user_id: user.user_id },
        ]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        { role: "ai", text: "❌ Error connecting to AI", user_id: user.user_id },
      ]);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Floating Button */}
      <button
        onClick={toggleChat}
        className="btn btn-primary rounded-circle shadow-lg"
        style={{ width: "60px", height: "60px", fontSize: "20px", zIndex: 1001 }}
      >
        💬
      </button>

      {/* Chat Window */}
      <div
        className="shadow-lg border rounded-4 bg-white p-3 d-flex flex-column position-fixed"
        style={{
          bottom: "120px",
          right: "105px",
          width: "400px",
          height: "500px",
          fontSize: "16px",
          zIndex: 1000,
          transition: "all 0.3s ease",
          transform: open ? "translateY(0)" : "translateY(600px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        <div className="fw-bold mb-2 d-flex justify-content-between align-items-center">
          <span className="m-0">AI Assistant</span>
          <button className="btn btn-sm btn-outline-danger py-0" onClick={clearChat}>
            clear chat
          </button>
        </div>

        {/* Messages */}
        <div
          className="flex-grow-1 mb-2 overflow-auto"
          style={{ display: "flex", flexDirection: "column" }}
        >
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              style={{
                display: "inline-block",
                padding: "10px 16px",
                marginBottom: "8px",
                borderRadius: "16px",
                backgroundColor: m.role === "user" ? "#cce4ff" : "#f0f0f0",
                color: m.role === "user" ? "#004085" : "#111",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "75%",
                wordWrap: "break-word",
                fontSize: "16px",
                fontStyle: m.text === "กำลังพิมพ์..." ? "italic" : "normal",
                opacity: m.text === "กำลังพิมพ์..." ? 0.7 : 1,
              }}
            >
              {m.text}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="d-flex">
          <input
            className="form-control me-2"
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ fontSize: "16px" }}
          />
          <button className="btn btn-primary" type="submit">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
