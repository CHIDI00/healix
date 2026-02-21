import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, History, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "ai";
  text: string;
}

const initialMessages: Message[] = [
  { role: "ai", text: "Hello Onyeka! How can I help you today?" },
];

interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChatModal = ({ open, onOpenChange }: AIChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");
    setIsAiTyping(true);

    setTimeout(() => {
      let aiResponse = "I'm processing your request. Please hold on.";
      if (userMsg.toLowerCase().includes("emr")) {
        aiResponse =
          "Done. Your EMR has been generated and sent to your Care Team.";
      } else if (userMsg.toLowerCase().includes("vitals")) {
        aiResponse =
          "Your vitals are looking great. Heart rate 72 BPM, SpO2 98%.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: aiResponse }]);
      setIsAiTyping(false);
    }, 1000);
  };

  const handleClearChat = () => {
    if (messages.length > 1) {
      setChatHistory((prev) => [...prev, messages]);
    }
    setMessages(initialMessages);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[33rem] border-slate-200 bg-white">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold text-slate-800">
              Healix
            </DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="h-8 text-xs text-slate-600 hover:text-indigo-600"
              >
                <History className="mr-1 h-4 w-4" />
                Chat History
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearChat}
                className="h-8 text-xs text-slate-600 hover:text-red-600"
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Clear Chat
              </Button>
            </div>
          </div>
        </DialogHeader>

        {showHistory ? (
          <div className="flex h-72 flex-col gap-3 overflow-y-auto py-2">
            {chatHistory.length === 0 ? (
              <div className="flex h-full items-center justify-center text-sm text-slate-400">
                No chat history yet
              </div>
            ) : (
              chatHistory.map((chat, chatIdx) => (
                <div
                  key={chatIdx}
                  className="rounded-lg border border-slate-200 bg-slate-50 p-3"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-500">
                      Chat {chatHistory.length - chatIdx}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMessages(chat);
                        setShowHistory(false);
                      }}
                      className="h-6 text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Load
                    </Button>
                  </div>
                  <div className="space-y-1 text-xs text-slate-600">
                    {chat.slice(0, 3).map((msg, msgIdx) => (
                      <div key={msgIdx} className="truncate">
                        <span className="font-medium">
                          {msg.role === "ai" ? "Healix" : "You"}:
                        </span>{" "}
                        {msg.text}
                      </div>
                    ))}
                    {chat.length > 3 && (
                      <div className="text-slate-400">
                        +{chat.length - 3} more messages
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="flex h-72 flex-col gap-3 overflow-y-auto py-2">
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "ai"
                    ? "self-start bg-indigo-50 text-slate-700"
                    : "self-end bg-indigo-600 text-white"
                }`}
              >
                {msg.text}
              </motion.div>
            ))}

            {isAiTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="self-start max-w-[80%] rounded-2xl bg-indigo-50 px-4 py-2.5"
              >
                <div className="flex gap-1">
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "0ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "150ms" }}
                  />
                  <span
                    className="h-2 w-2 animate-bounce rounded-full bg-indigo-400"
                    style={{ animationDelay: "300ms" }}
                  />
                </div>
              </motion.div>
            )}
          </div>
        )}

        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask Healix..."
            className="h-10 rounded-xl border-slate-200 bg-slate-50/50 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700"
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal;
