import { useCallback, useState } from "react";
import {
  generateGeminiReply,
  type GeminiMessage,
  type UserProfile,
} from "@/services/geminiApi";

interface UseGeminiConversationState {
  messages: GeminiMessage[];
  isLoading: boolean;
  isAiTyping: boolean;
  error: string | null;
}

export const useGeminiConversation = (user?: UserProfile | null) => {
  const [state, setState] = useState<UseGeminiConversationState>({
    messages: [],
    isLoading: false,
    isAiTyping: false,
    error: null,
  });

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) {
        return;
      }

      const userMessage: GeminiMessage = { role: "user", text: trimmed };

      // We capture the exact array we want to send to the API right here
      // to avoid React state closure bugs.
      let payloadMessages: GeminiMessage[] = [];

      setState((prev) => {
        payloadMessages = [...prev.messages, userMessage];
        return {
          ...prev,
          error: null,
          isLoading: true,
          isAiTyping: true,
          messages: payloadMessages,
        };
      });

      try {
        const aiReply = await generateGeminiReply(payloadMessages, user);

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, { role: "ai", text: aiReply }],
          isLoading: false,
          isAiTyping: false,
        }));
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to get AI response";

        setState((prev) => ({
          ...prev,
          error: message,
          isLoading: false,
          isAiTyping: false,
          messages: prev.messages.slice(0, -1),
        }));
      }
    },
    [user],
  );

  const clearConversation = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      isAiTyping: false,
      error: null,
    });
  }, []);

  const loadConversation = useCallback((messages: GeminiMessage[]) => {
    setState({
      messages,
      isLoading: false,
      isAiTyping: false,
      error: null,
    });
  }, []);

  const startNewConversation = useCallback(() => {
    clearConversation();
  }, [clearConversation]);

  return {
    ...state,
    sendMessage,
    clearConversation,
    loadConversation,
    startNewConversation,
  };
};
