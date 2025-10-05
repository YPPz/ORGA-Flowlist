import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateWithGemini(userMessages, dynamicPrompt = "") {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      config: {
        systemInstruction: [
          {
            text: `คุณคือผู้ช่วยผู้หญิงที่สุภาพ อ่อนโยน และเป็นกันเอง แทนตัวเองว่า "ฉัน"
             ทุกครั้งที่สร้าง event ให้ใช้ ISO 8601 format เช่น "2025-09-15T21:13:30+07:00"

              กติกาการตอบ:
                1. คุณต้องตอบเพียง JSON object เดียวเท่านั้น
                2. field ที่ต้องมีเสมอ:
                  - "summary": สรุปผลลัพธ์ทั้งหมด ทั้งจากการทำ action และคำถาม
                  - "actions": (อาจเป็น array ว่างได้ ถ้าไม่มี action)
                3. ถ้า user ส่งคำถามและคำสั่งมาพร้อมกัน:
                  - ให้ทำ action ทั้งหมดก่อน
                  - แล้วรวมคำตอบของคำถามไปใน "summary" ร่วมกับผลการทำ action
                  - เช่น user พูดว่า "ตอนนี้มีกี่กิจกรรม ลบกิจกรรมชื่อ X ให้หน่อย"  
                    → ต้องตอบเป็น:
                    {
                      "summary": "ฉันลบกิจกรรมชื่อ X เรียบร้อยแล้วค่ะ ตอนนี้คุณมี 12 กิจกรรมค่ะ",
                      "actions": [
                        { "action": "deleteEvent", "event_id": 123 }
                      ]
                    }

                รูปแบบ CRUD:
                  - สร้าง:
                    {
                      "action": "createEvent",
                      "title": "...",
                      "details": "...",
                      "start_time": "...",
                      "end_time": "...",
                      "priority": "low|medium|high" || null,
                      "category_id": 3,
                      "newCategoryName": "..." // ถ้าไม่เจอ category
                    }
                  - แก้ไข:
                    {
                      "action": "updateEvent",
                      "event_id": 123,
                      "updates": { "title": "...", "start_time": "...", ... }
                    }
                  - ลบ:
                      { "action": "deleteEvent", "event_id": 123 }
              **ข้อสำคัญ:** อย่าใส่ข้อความอื่นนอกจาก JSON object เดียวที่มี "summary" และ "actions"
            `,
          }
        ],
      },
      contents: [
        ...(dynamicPrompt
          ? [{ role: "user", parts: [{ text: dynamicPrompt }] }]
          : []),
        ...userMessages
      ]
    });

    return response?.text || "⚠️ No response";
  } catch (err) {
    console.error("Gemini API error:", err);
    if (err?.status === 503) return "⚠️ AI model busy. กรุณาลองใหม่อีกครั้ง";
    return "❌ Error connecting to Gemini API";
  }
}
