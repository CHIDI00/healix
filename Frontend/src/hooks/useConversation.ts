/**
 * useConversation Hook
 * Manages conversation state and API interactions
 */

import { useState, useCallback } from "react";
import {
  chatWithAssistant,
  getConversationDetail,
  updateConversation,
  getConversations,
  ChatMessage,
  ChatResponse,
  ConversationDetail,
} from "@/services/assistantApi";

export interface ConversationMessage {
  role: "user" | "ai";
  text: string;
  tools_used?: string[];
}

export interface UseConversationState {
  conversationId: number | null;
  messages: ConversationMessage[];
  isLoading: boolean;
  error: string | null;
  isAiTyping: boolean;
}

export const useConversation = () => {
  const [state, setState] = useState<UseConversationState>({
    conversationId: null,
    messages: [],
    isLoading: false,
    error: null,
    isAiTyping: false,
  });

  /**
   * Send a message to the AI assistant
   */
  const sendMessage = useCallback(
    async (text: string, useRag: boolean = true) => {
      if (!text.trim()) {
        setState((prev) => ({
          ...prev,
          error: "Message cannot be empty",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        isLoading: true,
        isAiTyping: true,
        error: null,
        messages: [...prev.messages, { role: "user", text }],
      }));

      try {
        const payload: ChatMessage = {
          message: text,
          use_rag: useRag,
        };

        if (state.conversationId) {
          payload.conversation_id = state.conversationId;
        }

        const response = await chatWithAssistant(payload);

        setState((prev) => ({
          ...prev,
          conversationId: response.conversation_id,
          messages: [
            ...prev.messages,
            {
              role: "ai",
              text: response.response,
              tools_used: response.tools_used,
            },
          ],
          isAiTyping: false,
        }));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to get response";
        setState((prev) => ({
          ...prev,
          isAiTyping: false,
          error: errorMessage,
          messages: prev.messages.slice(0, -1), // Remove user message on error
        }));
      } finally {
        setState((prev) => ({
          ...prev,
          isLoading: false,
        }));
      }
    },
    [state.conversationId],
  );

  /**
   * Load a conversation by ID
   */
  const loadConversation = useCallback(async (conversationId: number) => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      const conversation = await getConversationDetail(conversationId);

      const messages: ConversationMessage[] = conversation.messages.map(
        (msg) => ({
          role: (msg.role === "assistant" ? "ai" : msg.role) as "user" | "ai",
          text: msg.content,
          tools_used: msg.tools_used,
        }),
      );

      setState((prev) => ({
        ...prev,
        conversationId: conversation.id,
        messages,
      }));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversation";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    } finally {
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  }, []);

  /**
   * Start a new conversation
   */
  const startNewConversation = useCallback(
    (initialMessage?: string) => {
      const messages: ConversationMessage[] = [];
      if (initialMessage) {
        messages.push({ role: "user", text: initialMessage });
      }

      setState((prev) => ({
        ...prev,
        conversationId: null,
        messages,
        error: null,
      }));

      if (initialMessage) {
        sendMessage(initialMessage);
      }
    },
    [sendMessage],
  );

  /**
   * Clear conversation (local state only)
   */
  const clearConversation = useCallback(() => {
    setState({
      conversationId: null,
      messages: [],
      isLoading: false,
      error: null,
      isAiTyping: false,
    });
  }, []);

  /**
   * Archive conversation on backend
   */
  const archiveConversation = useCallback(async () => {
    if (!state.conversationId) {
      setState((prev) => ({
        ...prev,
        error: "No active conversation to archive",
      }));
      return;
    }

    try {
      await updateConversation(state.conversationId, { is_active: false });
      clearConversation();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to archive conversation";
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }));
    }
  }, [state.conversationId, clearConversation]);

  return {
    ...state,
    sendMessage,
    loadConversation,
    startNewConversation,
    clearConversation,
    archiveConversation,
  };
};
