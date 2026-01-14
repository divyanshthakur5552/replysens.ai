import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ChatHeaderProps {
  title: string;
  subtitle: string;
}

export function ChatHeader({ title, subtitle }: ChatHeaderProps) {
  return (
    <div 
      className="h-16 flex items-center justify-between bg-[var(--surface)]/50 backdrop-blur-sm flex-shrink-0" 
      style={{ paddingLeft: "24px", paddingRight: "24px" }}
    >
      <div className="flex items-center gap-3">
        <div>
          <h1 className="font-semibold text-[var(--text-primary)]">{title}</h1>
          <p className="text-xs text-[var(--text-secondary)]">{subtitle}</p>
        </div>
      </div>
      <ThemeToggle />
    </div>
  );
}
