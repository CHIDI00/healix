import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface Message {
  role: "user" | "ai";
  text: string;
}

const initialMessages: Message[] = [{ role: "ai", text: "Hello Onyeka! How can I help you today?" }];

interface AIChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AIChatModal = ({ open, onOpenChange }: AIChatModalProps) => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      let aiResponse = "I'm processing your request. Please hold on.";
      if (userMsg.toLowerCase().includes("emr")) {
        aiResponse = "Done. Your EMR has been generated and sent to your Care Team.";
      } else if (userMsg.toLowerCase().includes("vitals")) {
        aiResponse = "Your vitals are looking great. Heart rate 72 BPM, SpO2 98%.";
      }
      setMessages((prev) => [...prev, { role: "ai", text: aiResponse }]);
    }, 1000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl h-[33rem] border-slate-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-slate-800">Healix</DialogTitle>
        </DialogHeader>

        <div className="flex h-72 flex-col gap-3 overflow-y-auto py-2">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                msg.role === "ai" ? "self-start bg-indigo-50 text-slate-700" : "self-end bg-indigo-600 text-white"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}
        </div>

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
          <Button type="submit" size="icon" className="h-10 w-10 shrink-0 rounded-xl bg-indigo-600 hover:bg-indigo-700">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AIChatModal;
