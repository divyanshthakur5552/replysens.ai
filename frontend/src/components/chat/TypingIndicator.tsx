import { motion } from "framer-motion";

export function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start"
    >
      <div className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-[var(--background)]">
        {[0, 0.2, 0.4].map((delay, i) => (
          <motion.span
            key={i}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay }}
            className="w-2 h-2 rounded-full bg-[var(--primary)]"
          />
        ))}
      </div>
    </motion.div>
  );
}
