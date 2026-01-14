import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "confirmed" | "pending" | "canceled" | string;
  className?: string;
}

const statusStyles = {
  confirmed: "bg-green-500/20 text-green-400 border-green-500/30",
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  canceled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export function StatusPill({ status, className }: StatusPillProps) {
  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border capitalize",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
