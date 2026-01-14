import { motion } from "framer-motion";

interface ChatErrorProps {
  message: string;
}

export function ChatError({ message }: ChatErrorProps) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex justify-center"
    >
      <div className="px-4 py-2 rounded-lg bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
        {message}
      </div>
    </motion.div>
  );
}
