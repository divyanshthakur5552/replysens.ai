import { motion } from "framer-motion";

interface ChatWelcomeProps {
  onSuggestionClick: (suggestion: string) => void;
}

const SUGGESTIONS = [
  "Book an appointment",
  "What services do you offer?",
  "Tell me about pricing"
];

export function ChatWelcome({ onSuggestionClick }: ChatWelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] gap-6">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center shadow-lg shadow-[var(--primary)]/20"
      >
        <img src="/icon.png" alt="ReplySense" className="w-16 h-16" />
      </motion.div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-[var(--text-primary)] mb-2">
          How can I help you today?
        </h2>
        <p className="text-[var(--text-secondary)]">
          Ask me anything about bookings, services, or pricing
        </p>
      </motion.div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex flex-wrap gap-3 justify-center mt-4"
      >
        {SUGGESTIONS.map((suggestion, i) => (
          <button
            key={i}
            onClick={() => onSuggestionClick(suggestion)}
            className="rounded-full bg-[var(--card)] border border-[var(--border)] text-[var(--text-secondary)] text-sm hover:bg-[var(--surface)] hover:border-[var(--primary)]/30 hover:text-[var(--text-primary)] transition-all"
            style={{ padding: "10px 20px" }}
          >
            {suggestion}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
