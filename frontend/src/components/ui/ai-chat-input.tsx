"use client"

import { useState, useEffect, useRef } from "react";
import { Lightbulb, Mic, Globe, Paperclip, Send } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

const PLACEHOLDERS = [
  "Ask me anything...",
  "Book an appointment",
  "What services do you offer?",
  "Tell me about pricing",
  "What are your working hours?",
  "I need help with...",
];

interface AIChatInputProps {
  onSendMessage: (message: string) => Promise<void>;
  isLoading?: boolean;
}

const AIChatInput = ({ onSendMessage, isLoading = false }: AIChatInputProps) => {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [showPlaceholder, setShowPlaceholder] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [thinkActive, setThinkActive] = useState(false);
  const [deepSearchActive, setDeepSearchActive] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isActive || inputValue) return;
    const interval = setInterval(() => {
      setShowPlaceholder(false);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
        setShowPlaceholder(true);
      }, 400);
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive, inputValue]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        if (!inputValue) setIsActive(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [inputValue]);

  const handleActivate = () => setIsActive(true);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue("");
    await onSendMessage(message);
  };

  return (
    <motion.div
      ref={wrapperRef}
      className="w-full max-w-3xl rounded-3xl bg-[var(--card)] shadow-lg"
      animate={isActive || inputValue ? { height: 110 } : { height: 72 }}
      transition={{ type: "spring", stiffness: 120, damping: 18 }}
      style={{ overflow: "hidden" }}
      onClick={handleActivate}
    >
      {/* Input Row */}
      <div className="flex items-center h-[72px] px-4 gap-3">
        <div className="w-1 flex-shrink-0"></div>
        <button
          className="flex-shrink-0 p-3 rounded-full hover:bg-[var(--surface)] transition text-[var(--text-secondary)]"
          title="Attach file"
          type="button"
          tabIndex={-1}
        >
          <Paperclip size={20} />
        </button>

        {/* Text Input & Placeholder */}
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="w-full border-0 outline-0 py-2 text-base bg-transparent text-[var(--text-primary)]"
            onFocus={handleActivate}
            placeholder={isActive ? "Type a message..." : ""}
          />
          {!isActive && !inputValue && (
            <div className="absolute inset-0 flex items-center pointer-events-none">
              <AnimatePresence mode="wait">
                {showPlaceholder && (
                  <motion.span
                    key={placeholderIndex}
                    className="text-[var(--text-secondary)] truncate"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    {PLACEHOLDERS[placeholderIndex]}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        <button
          className="flex-shrink-0 p-3 rounded-full hover:bg-[var(--surface)] transition text-[var(--text-secondary)]"
          title="Voice input"
          type="button"
          tabIndex={-1}
        >
          <Mic size={20} />
        </button>

        <button
          className="flex-shrink-0 bg-[var(--primary)] hover:bg-[var(--secondary)] text-white w-10 h-10 rounded-full transition-colors disabled:opacity-50 flex items-center justify-center"
          title="Send"
          type="button"
          tabIndex={-1}
          onClick={handleSend}
          disabled={isLoading}
        >
          <Send size={16} />
        </button>
        <div className="w-3 flex-shrink-0"></div>
      </div>

      {/* Expanded Controls */}
      <motion.div
        className="px-6 pb-4"
        initial={{ opacity: 0 }}
        animate={isActive || inputValue ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
       
      </motion.div>
    </motion.div>
  );
};

export { AIChatInput };
