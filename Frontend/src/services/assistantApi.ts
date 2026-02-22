const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL}assistant`;

export interface ChatMessage {
  message: string;
  conversation_id?: number;
  use_rag?: boolean;
}

export interface ChatResponse {
  conversation_id: number;
  message_id: number;
  response: string;
  tools_used: string[];
  health_data_context?: Record<string, string | number | boolean>;
  timestamp: string;
}

export interface ConversationItem {
  id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: ConversationItem[];
}

export interface ConversationDetail {
  id: number;
  title: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  user: number;
  messages: Array<{
    id: number;
    role: "user" | "assistant";
    content: string;
    tools_used: string[];
    created_at: string;
  }>;
}

export interface HealthSummaryRequest {
  days?: number;
  conversation_id?: number;
}

export interface HealthSummaryResponse {
  summary: string;
  conversation_id: number;
  health_data_overview: {
    average_heart_rate?: number;
    total_steps?: number;
    average_sleep_duration?: number;
    average_calories_consumed?: number;
  };
  key_insights: string[];
  generated_at: string;
}

export interface WellnessRecommendationsRequest {
  focus_areas?: ("nutrition" | "fitness" | "sleep" | "stress")[];
  conversation_id?: number;
}

export interface WellnessRecommendationsResponse {
  recommendations: Array<{
    category: string;
    recommendation: string;
    priority: "high" | "medium" | "low";
    timeframe: string;
  }>;
  conversation_id: number;
  generated_at: string;
}

// Helper to get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem("healix_token");
};

// Helper to build headers with authentication
const getHeaders = (): HeadersInit => {
  const token = getAuthToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Token ${token}`;
  }
  return headers;
};

interface ApiError extends Error {
  status?: number;
  data?: Record<string, unknown>;
}

// Helper to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorData: Record<string, unknown> = {};

    if (contentType?.includes("application/json")) {
      errorData = await response.json();
    }

    const error: ApiError = new Error(
      (typeof errorData.message === "string" ? errorData.message : null) ||
        (typeof errorData.error === "string" ? errorData.error : null) ||
        `HTTP ${response.status}`,
    );
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }
  return {} as T;
};

/*
Chat with the AI Assistant
POST /chat/
 */
export const chatWithAssistant = async (
  payload: ChatMessage,
): Promise<ChatResponse> => {
  const response = await fetch(`${API_BASE_URL}/chat/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<ChatResponse>(response);
};

/*
Get list of user's conversations
GET /conversations/
 */
export const getConversations = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: { is_active?: boolean; ordering?: string },
): Promise<ConversationListResponse> => {
  const filterEntries = Object.entries(filters || {}).filter(
    ([, v]) => v !== undefined,
  );
  const params = new URLSearchParams([
    ["page", page.toString()],
    ["page_size", pageSize.toString()],
    ...filterEntries.map(([k, v]) => [k, String(v)]),
  ]);

  const response = await fetch(`${API_BASE_URL}/conversations/?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse<ConversationListResponse>(response);
};

/*
 Get a specific conversation with all messages
 GET /conversations/{id}/
 */
export const getConversationDetail = async (
  conversationId: number,
): Promise<ConversationDetail> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );
  return handleResponse<ConversationDetail>(response);
};

/*
Update conversation (title, active status)
PUT /conversations/{id}/
 */
export const updateConversation = async (
  conversationId: number,
  updates: { title?: string; is_active?: boolean },
): Promise<ConversationDetail> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updates),
    },
  );
  return handleResponse<ConversationDetail>(response);
};

/*
Delete a conversation
DELETE /conversations/{id}/
 */
export const deleteConversation = async (
  conversationId: number,
): Promise<void> => {
  const response = await fetch(
    `${API_BASE_URL}/conversations/${conversationId}/`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.status}`);
  }
};

/*
Generate health summary
POST /health-summary/
 */
export const generateHealthSummary = async (
  payload: HealthSummaryRequest = {},
): Promise<HealthSummaryResponse> => {
  const response = await fetch(`${API_BASE_URL}/health-summary/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<HealthSummaryResponse>(response);
};

/*
Get wellness recommendations
POST /wellness-recommendations/
 */
export const getWellnessRecommendations = async (
  payload: WellnessRecommendationsRequest = {},
): Promise<WellnessRecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/wellness-recommendations/`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse<WellnessRecommendationsResponse>(response);
};

/*
Get health insights
GET /insights/
 */
export const getHealthInsights = async (
  page: number = 1,
  pageSize: number = 10,
  filters?: {
    insight_type?: "summary" | "recommendation" | "alert" | "pattern" | "trend";
    is_read?: boolean;
    ordering?: string;
  },
) => {
  const filterEntries = Object.entries(filters || {}).filter(
    ([, v]) => v !== undefined,
  );
  const params = new URLSearchParams([
    ["page", page.toString()],
    ["page_size", pageSize.toString()],
    ...filterEntries.map(([k, v]) => [k, String(v)]),
  ]);

  const response = await fetch(`${API_BASE_URL}/insights/?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/*
Get available tools
GET /tools/
 */
export const getAvailableTools = async (filters?: {
  category?: string;
  is_active?: boolean;
}) => {
  const filterEntries = Object.entries(filters || {}).filter(
    ([, v]) => v !== undefined,
  );
  const params = new URLSearchParams(
    filterEntries.map(([k, v]) => [k, String(v)]),
  );

  const response = await fetch(`${API_BASE_URL}/tools/?${params}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

/*
Get assistant status (no auth required)
GET /status/
 */
export const getAssistantStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/status/`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return handleResponse(response);
};
