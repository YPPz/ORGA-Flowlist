import { generateWithGemini } from "../services/gemini.js";
import * as eventService from "./eventController.js";
import Category from "../models/Category.js"
import dayjs from "../helpers/dayjsSetup.js";

export const askAssistant = async (req, res) => {
  try {
    const { userMessages } = req.body;
    const user = req.user;

    if (!user) return res.status(401).json({ error: "Unauthorized" });
    console.log("Assistant request from user:", user.user_id, userMessages);

    if (!userMessages || !Array.isArray(userMessages) || userMessages.length === 0) {
      return res.status(400).json({ error: "Messages is required" });
    }

    const googleAccessToken = user.provider === 'google' ? req.googleAccessToken : null;
    const events = await eventService.listEventsRaw(user, googleAccessToken);
    const categories = await Category.getAllCategoriesByUser(user.user_id);
    const now = dayjs().tz("Asia/Bangkok").format();

    const dynamicPrompt = ` 
      แทน user ว่า "คุณ ${user.display_name} " 
      เวลาปัจจุบันคือ ${now}
      events ปัจจุบัน: ${JSON.stringify(events, null, 2)} 
      categories ปัจจุบัน: ${JSON.stringify(categories, null, 2)} 
    `;

    const aiResponse = await generateWithGemini(userMessages.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.text }],
    })), dynamicPrompt);

    let parsed;
    try {
      let raw = aiResponse.replace(/```(json)?/g, "").trim();

      const firstJsonMatch = raw.match(/\{[\s\S]*\}/);
      if (firstJsonMatch) {
        raw = firstJsonMatch[0];
      }

      parsed = JSON.parse(raw);

    } catch {
      console.warn("Raw AI response:", aiResponse);
      parsed = {
        summary: aiResponse,
        actions: []
      };
    }

    console.log("Raw AI response:", aiResponse);
    console.log("Parsed AI actions:", parsed.actions);

    // AI sends summary + actions
    const { summary, actions } = parsed;
    const results = [];

    if (Array.isArray(actions)) {
      for (const actionItem of actions) {
        try {
          let result;
          let answerText;
          let data;

          switch (actionItem.action) {
            case "createEvent":
              result = await eventService.createEventRaw(user, actionItem, googleAccessToken);
              answerText = `สร้างกิจกรรม "${result.title}" เรียบร้อยแล้วค่ะ `;
              data = result;
              break;

            case "updateEvent":
              result = await eventService.updateEventRaw(user, actionItem.event_id, actionItem.updates, googleAccessToken);
              answerText = `แก้ไขกิจกรรม "${result.title}" เรียบร้อยแล้วค่ะ `;
              data = result;
              break;

            case "deleteEvent":
              result = await eventService.deleteEventRaw(user, actionItem.event_id, googleAccessToken);
              answerText = `ลบกิจกรรมเรียบร้อยแล้วค่ะ 🗑️`;
              data = { event_id: actionItem.event_id };
              break;

            default:
              answerText = `Action "${actionItem.action}" ไม่รองรับ`;
              data = null;
              break;
          }

          results.push({
            type: "action",
            success: true,
            answer: answerText,
            data,
          })

          console.log("Executing action:", actionItem);
          console.log("Action result:", result);;

        } catch (err) {
          results.push({
            type: "action",
            success: false,
            answer: `เกิดข้อผิดพลาดกับ action "${actionItem.action}" กรุณาลองใหม่ภายหลังค่ะ ❌`,
            data: null,
          });
          console.error("Action failed:", err);
        }
      }
    }

    let finalSummary = summary;
    if (results.some(r => r.success === false)) {
      finalSummary = "ไม่สามารถทำรายการได้ กรุณาลองใหม่ภายหลังค่ะ ❌";
    }

    return res.json({ summary: finalSummary, type: "batch", results });

  } catch (err) {
    console.error("Assistant error:", err);
    res.status(500).json({ error: "Failed to process assistant request" });
  }
};
