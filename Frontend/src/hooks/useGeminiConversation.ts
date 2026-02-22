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
      const currentMessages = state.messages;
      const updatedMessages = [...currentMessages, userMessage];

      setState((prev) => ({
        ...prev,
        error: null,
        isLoading: true,
        isAiTyping: true,
        messages: [...prev.messages, userMessage],
      }));

      try {
        const aiReply = await generateGeminiReply(updatedMessages, user);

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
        }));
      }
    },
    [state.messages],
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
