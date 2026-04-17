import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateSandboxContent(rawNotes: string) {
  const prompt = `You are an expert technical recruiter and HR professional.
A user has provided the following raw notes about a desired role:

RAW NOTES:
${rawNotes}

Please generate two distinct outputs based on these notes:
1) A polished, correctly formatted Job Description tailored for LinkedIn. Make it engaging, inclusive, and professional.
2) An Interview Guide containing exactly 10 behavioral questions specifically targeting the soft and hard skills implied by the JD. Include brief rubrics or "look for" signs in the candidate's answers.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH },
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            jd: { type: Type.STRING, description: "The LinkedIn Job Description in Markdown format" },
            guide: { type: Type.STRING, description: "The Interview Guide in Markdown format" },
          },
          required: ["jd", "guide"],
        },
      },
    });

    const jsonStr = response.text || "{}";
    const data = JSON.parse(jsonStr);
    return {
      jd: data.jd || "No JD generated.",
      guide: data.guide || "No Guide generated.",
    };
  } catch (err: any) {
    console.error("Error generating content:", err);
    throw new Error(err.message || "Failed to generate content.");
  }
}

export function createRecruiterChat() {
  return ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are an expert technical recruiter assistant. You help users refine job descriptions, understand candidate profiles, build interview rubrics, and answer general recruiting questions. Be concise, professional, and knowledgeable. Only speak to recruitment, HR, and talent acquisition topics.",
    },
  });
}
