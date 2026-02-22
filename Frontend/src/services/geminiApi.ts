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
        functionCall?: {
          name: string;
          args: any;
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

// 1. UPDATED PROMPT: Bounded Health Assistant
const HEALTHCARE_SYSTEM_PROMPT = `You are Helix, the official AI medical partner and health assistant for the Healix platform.

### DOMAIN RESTRICTION (CRITICAL GUARDRAIL):
- You are STRICTLY a health, medical, and wellness assistant. 
- If the user asks about ANY topic outside of health, medicine, wellness, diet, fitness, or their vitals (e.g., coding, politics, math, general knowledge), you MUST politely refuse to answer and remind them that you are only here to assist with their health.

### COMMUNICATION RULES:
- Be clear, direct, and highly professional. Avoid conversational filler.
- Use bullet points when listing data, symptoms, or recommendations to keep the UI readable.
- When answering general health questions, provide thorough but concise explanations.
- Adopt a calm, clinical tone like an expert doctor or wellness coach.

### YOUR CAPABILITIES:
1. Answer general health, wellness, fitness, and medical questions accurately.
2. Analyze the user's live health data (provided below) when they ask about their current status.
3. If the user asks you to send, share, or email their data to someone, use the send_vitals_report tool.
4. If the user reports severe symptoms (e.g., chest pain, difficulty breathing), OR if their vitals drop to dangerous levels, STOP chatting and immediately trigger the alert_caregiver tool.`;

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
              description:
                "The medical reason for the alert (e.g., 'Heart rate dropped to 40 bpm' or 'User reported severe chest pain')",
            },
            urgencyLevel: {
              type: "STRING",
              description: "Either 'HIGH' or 'CRITICAL'",
            },
          },
          required: ["reason", "urgencyLevel"],
        },
      },
      {
        name: "send_vitals_report",
        description:
          "Send the user's current vitals data to their caregiver, doctor, or family member when the user explicitly asks to share or send their data.",
        parameters: {
          type: "OBJECT",
          properties: {
            recipient_type: {
              type: "STRING",
              description:
                "Who to send the report to (e.g., 'doctor', 'caregiver', 'family')",
            },
          },
          required: ["recipient_type"],
        },
      },
    ],
  },
];

// FIXED: This now strictly takes 1 argument and maps the messages correctly
const buildContents = (messages: GeminiMessage[]) => {
  return messages.map((message) => ({
    role: message.role === "ai" ? "model" : "user",
    parts: [{ text: message.text }],
  }));
};

interface LiveVitals {
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  oxygen_saturation?: number;
  respiratory_rate?: number;
  body_temperature?: number;
  timestamp?: string;
  [key: string]: string | number | boolean | null | undefined;
}

const fetchLiveVitals = async (): Promise<LiveVitals | null> => {
  try {
    const token = localStorage.getItem("healix_token");
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}vitals/pull/`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Token ${token}` } : {}),
        },
      },
    );

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as LiveVitals;
    return data;
  } catch {
    return null;
  }
};

export const generateGeminiReply = async (
  messages: GeminiMessage[],
  user?: UserProfile | null,
): Promise<string> => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key. Set VITE_GEMINI_API_KEY in .env.");
  }

  const userName =
    user?.first_name && user?.last_name
      ? `${user.first_name} ${user.last_name}`
      : user?.username || "there";

  const liveVitals = await fetchLiveVitals();

  // FIXED: Tells the AI exactly what to do if the hardware is disconnected
  const vitalsContext = liveVitals
    ? `### LIVE SENSOR DATA:
- Heart Rate: ${liveVitals.heart_rate ?? "N/A"} BPM
- Blood Pressure: ${liveVitals.blood_pressure_systolic ?? "N/A"}/${liveVitals.blood_pressure_diastolic ?? "N/A"} mmHg
- Blood Oxygen (SpO2): ${liveVitals.oxygen_saturation ?? "N/A"}%
- Respiratory Rate: ${liveVitals.respiratory_rate ?? "N/A"} br/min
- Body Temp: ${liveVitals.body_temperature ?? "N/A"}°C
- Last Sync: ${liveVitals.timestamp ?? "Just now"}`
    : "### LIVE SENSOR DATA:\nLive vitals are currently offline. You can still answer general health and wellness questions normally. Only mention that vitals are offline if the user specifically asks to check their current hardware data.";

  const dynamicPrompt = `${HEALTHCARE_SYSTEM_PROMPT}\n\nUSER PROFILE:\n- Name: ${userName}\n\n${vitalsContext}`;

  const response = await fetch(
    `${GEMINI_ENDPOINT}?key=${encodeURIComponent(GEMINI_API_KEY)}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // FIXED: The system instruction is now injected into the correct property
        systemInstruction: {
          parts: [{ text: dynamicPrompt }],
        },
        contents: buildContents(messages),
        tools: tools,
        generationConfig: {
          temperature: 0.6,
          maxOutputTokens: 700,
        },
      }),
    },
  );

  const data: GeminiGenerateResponse = await response.json();

  if (!response.ok) {
    console.error("Gemini API Error:", {
      status: response.status,
      error: data.error,
    });
    throw new Error(
      data.error?.message || `Gemini request failed (HTTP ${response.status})`,
    );
  }

  const firstPart = data.candidates?.[0]?.content?.parts?.[0];

  if (firstPart?.functionCall) {
    const call = firstPart.functionCall;
    const token = localStorage.getItem("healix_token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
    };

    if (call.name === "alert_caregiver") {
      const { reason, urgencyLevel } = call.args;
      console.log(`FIRING EMERGENCY REST API: ${urgencyLevel} - ${reason}`);

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}emergency/trigger/`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            reason,
            urgency_level: urgencyLevel,
          }),
        });
      } catch (err) {
        console.error("Failed to route emergency alert", err);
      }

      return `**EMERGENCY PROTOCOL ACTIVATED** \n\nI have transmitted an immediate SOS to your emergency contacts via SMS. \n\n**Detected:** ${reason}. \n\nPlease sit down and wait for help.`;
    }

    if (call.name === "send_vitals_report") {
      const { recipient_type } = call.args;
      console.log(`FIRING DATA SHARE REST API TO: ${recipient_type}`);

      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL}vitals/share/`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            recipient_type: recipient_type,
          }),
        });
      } catch (err) {
        console.error("Failed to share vitals report", err);
      }

      return `**REPORT SHARED**\n\nI have successfully sent your real-time vitals to your ${recipient_type}.`;
    }
  }

  const text = firstPart?.text?.trim();

  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  return text;
};
