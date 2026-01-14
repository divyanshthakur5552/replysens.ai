import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === "user";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`rounded-2xl max-w-[80%] ${
          isUser
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--surface)] text-[var(--text-primary)]"
        }`}
        style={{ wordBreak: "break-word", padding: "12px 16px" }}
      >
        {isUser ? (
          <p className="text-[15px] leading-relaxed">{message.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 prose-ul:my-2 prose-ol:my-2 prose-li:my-1 prose-blockquote:my-2 prose-pre:my-2 prose-code:bg-[var(--surface)] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-[var(--primary)] prose-pre:bg-[var(--surface)] prose-pre:p-3 prose-pre:rounded-lg prose-strong:text-[var(--text-primary)] prose-headings:text-[var(--text-primary)] text-[var(--text-primary)]">
            <ReactMarkdown>{message.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
}
