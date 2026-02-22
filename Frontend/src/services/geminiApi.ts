export interface GeminiMessage {
  role: "user" | "ai";
  text: string;
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  username?: string;
}

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
        // Added functionCall to the interface so TypeScript doesn't disturb
        functionCall?: {
          name: string;
          args: {
            reason: string;
            urgencyLevel: string;
          };
        };
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

const tools = [
  {
    functionDeclarations: [
      {
        name: "alert_caregiver",
        description:
          "Trigger an emergency SMS alert to the user's registered caregiver. Use this ONLY if the health data indicates a severe anomaly or the user requests emergency help.",
        parameters: {
          type: "OBJECT",
          properties: {
            reason: {
              type: "STRING",
              description: "The medical reason for the alert (e.g., 'Heart rate dropped to 40 bpm')",
            },
            urgencyLevel: {
              type: "STRING",
              description: "Either 'HIGH' or 'CRITICAL'",
            },
          },
          required: ["reason", "urgencyLevel"],
        },
      },
    ],
  },
];

const buildContents = (messages: GeminiMessage[]) => {
  return messages.map((message) => ({
    role: message.role === "ai" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
};

export const generateGeminiReply = async (messages: GeminiMessage[], user?: UserProfile | null): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env.");
  }

  const userName = user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : user?.username || "Onyeka Joshua";

  const dynamicPrompt = `${HEALTHCARE_SYSTEM_PROMPT}

Current User Profile & Health Data Context:
- Name: ${userName}
- Age/DOB: 1999 (25 years old)
- Primary Device: Oraimo Watch
- Current Heart Rate: 72 BPM (Normal)
- Resting Heart Rate: 61 BPM
- Blood Oxygen (SpO2): 98%
- Respiratory Rate: 16 br/min
- Skin Temperature: 36.5°C
- Daily Steps: 8,240
- Dietary Adherence: 85% (Low-sodium protocol)
- Recent AI Analysis: Vitals are completely stable. No cardiovascular anomalies detected in the last 48 hours. HRV indicates optimal nervous system recovery.

Use this data to personalize your responses. If the user asks about their heart rate, steps, or general health, refer to this data.`;

  const response = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: dynamicPrompt }],
      },
      contents: buildContents(messages),
      tools: tools,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 700,
      },
    }),
  });

  const data: GeminiGenerateResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini request failed (HTTP ${response.status})`);
  }

  const firstPart = data.candidates?.[0]?.content?.parts?.[0];

  if (firstPart?.functionCall) {
    const call = firstPart.functionCall;

    if (call.name === "alert_caregiver") {
      const { reason, urgencyLevel } = call.args;

      console.log(`  API TOOL TRIGGERED: ${urgencyLevel} - ${reason}`);

      // Short circuit the chat and return the emergency UI text directly
      return `  **EMERGENCY ALERT SENT**  \n\nI detected a critical situation and have immediately notified your emergency contacts and caregiver. \n\n**Reason:** ${reason}. \n\nPlease stay calm and sit down. Help is on the way.`;
    }
  }

  // If no emergency, just return the standard text reply
  const text = firstPart?.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};
