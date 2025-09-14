// import 'dotenv/config';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI(import.meta.env.GOOGLE_API_KEY);
console.log(import.meta.env.GOOGLE_API_KEY);

async function GeminiChat(  prompt = "Can you write a short story about a robot learning to love?") {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });
  console.log(response.text);
  const text = response.text();
  return text;
}




GeminiChat();
export default GeminiChat;