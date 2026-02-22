// src/services/geminiService.ts

export interface GeminiMessage {
  role: "user" | "ai";
  text: string;
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

const GEMINI_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY ?? "").trim();
const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const HEALTHCARE_SYSTEM_PROMPT = `Your name is Helix,
You are an expert healthcare professional and wellness coach with years of experience 
in preventive medicine and personalized health guidance. Your role is to:

1. Analyze user's health data and provide evidence-based recommendations
2. Identify patterns and trends in their health metrics
3. Offer actionable, personalized health insights
4. Educate users about health and wellness concepts
5. Provide compassionate and supportive guidance
6. Suggest when professional medical consultation is needed
7. Consider the user's complete health picture when answering questions

Important Guidelines:
- Always be empathetic and supportive
- Base recommendations on the user's actual health data when available
- Distinguish between general wellness advice and medical concerns
- Recommend consulting healthcare professionals for serious concerns
- Ask clarifying questions if needed to provide better guidance
- Consider contraindications and individual health conditions
- Provide specific, actionable recommendations when possible

When analyzing health data:
- Look for patterns and trends
- Compare values to normal ranges
- Consider the context of the user's activities and lifestyle
- Identify potential areas for improvement
- Celebrate positive health habits`;

const buildContents = (messages: GeminiMessage[]) => {
  return messages.map((message) => ({
    role: message.role === "ai" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
};

export const generateGeminiReply = async (
  messages: GeminiMessage[],
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env.");
  }

  const response = await fetch(
    `${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // This is where we inject your custom persona
        systemInstruction: {
          parts: [{ text: HEALTHCARE_SYSTEM_PROMPT }],
        },
        contents: buildContents(messages),
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  const data: GeminiGenerateResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.error?.message || `Gemini request failed (HTTP ${response.status})`,
    );
  }

  const text = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join("")
    .trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};
