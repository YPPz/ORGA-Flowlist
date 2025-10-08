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

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages, open]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const timestampId = Date.now();
    const userMessage = { role: "user", text: input, user_id: user.user_id, id: timestampId };
    const typingId = `ai-typing-${timestampId}`;

    setMessages(prev => [
      ...prev,
      userMessage,
      { role: "ai", text: "กำลังพิมพ์...", id: typingId, user_id: user.user_id },
    ]);
    setInput("");

    try {
      const response = await sendMessageToAI(messages.filter(m => m.user_id === user.user_id).concat(userMessage));

      if (response?.summary) {
        setMessages(prev => [
          ...prev.filter(m => m.id !== typingId),
          { role: "ai", text: response.summary, user_id: user.user_id },
        ]);

        if (response.results?.some(r => r.success)) {
          const refreshed = await getEvents(location.pathname === "/" ? 7 : null);
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
        className="btn btn-primary rounded-circle shadow-lg d-flex justify-content-center align-items-center"
        style={{
          width: "50px",
          height: "50px",
          fontSize: "18px",
          zIndex: 1001,
          position: "fixed",
          bottom: "20px",
          right: "20px"
        }}
      >
        💬
      </button>

      {/* Chat Window */}
      <div
        className="shadow-lg border rounded-4 bg-white d-flex flex-column position-fixed p-2"
        style={{
          bottom: "80px",
          right: "20px",
          width: "90%",
          maxWidth: "400px",
          height: "70vh",
          fontSize: "16px",
          zIndex: 1000,
          transition: "all 0.3s ease",
          transform: open ? "translateY(0)" : "translateY(100vh)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div className="fw-bold mb-2 d-flex justify-content-between align-items-center px-2 py-1 border-bottom">
          <span className="m-0">AI Assistant</span>
          <button className="btn btn-sm btn-outline-danger py-0" onClick={clearChat}>
            clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-grow-1 overflow-auto d-flex flex-column p-2" style={{ gap: "6px" }}>
          {messages.map((m, idx) => (
            <div
              key={m.id || idx}
              style={{
                padding: "8px 12px",
                borderRadius: "16px",
                backgroundColor: m.role === "user" ? "#cce4ff" : "#f0f0f0",
                color: m.role === "user" ? "#004085" : "#111",
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                maxWidth: "80%",
                wordWrap: "break-word",
                fontSize: "14px",
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
        <form onSubmit={handleSend} className="d-flex p-2 gap-2">
          <input
            className="form-control"
            placeholder="Ask AI..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ fontSize: "14px" }}
          />
          <button className="btn btn-primary" type="submit">
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
