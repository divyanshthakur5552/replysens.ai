import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "confirmed" | "pending" | "canceled" | string;
  className?: string;
}

const statusStyles = {
  confirmed: "bg-green-500/20 text-green-400",
  pending: "bg-yellow-500/20 text-yellow-400",
  canceled: "bg-red-500/20 text-red-400",
};

export function StatusPill({ status, className }: StatusPillProps) {
  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.pending;
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full text-xs font-medium capitalize",
        style,
        className
      )}
      style={{ padding: "6px 16px" }}
    >
      {status}
    </span>
  );
}
