const API_URL = import.meta.env.VITE_API_URL;

export async function sendMessageToAI(userMessages) {
  try {
    const res = await fetch(`${API_URL}/api/assist/ask`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessages }),
    });
    
    const data = await res.json();
    return data;

  } catch (err) {
    console.error("AI fetch error:", err);
    return  "❌ Error connecting to server";
  }
}
