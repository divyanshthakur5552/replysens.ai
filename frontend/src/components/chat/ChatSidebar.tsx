import type { Dispatch, SetStateAction } from "react";
import { motion } from "framer-motion";
import { Sidebar, SidebarBody, SidebarLink, LogoutButton } from "@/components/ui/sidebar";
import { 
  MessageSquare, 
  LayoutDashboard, 
  Inbox, 
  Settings
} from "lucide-react";

interface ChatSidebarProps {
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

const NAV_LINKS = [
  { label: "Chat", href: "/chat", icon: MessageSquare },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Inbox", href: "/inbox", icon: Inbox },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function ChatSidebar({ open, setOpen }: ChatSidebarProps) {
  const links = NAV_LINKS.map(({ label, href, icon: Icon }) => ({
    label,
    href,
    icon: <Icon className="text-[var(--text-secondary)] h-5 w-5 flex-shrink-0" />,
  }));

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
          {/* Logo */}
          <div className="flex items-center gap-2" style={{ paddingLeft: "12px", paddingTop: "16px" }}>
            <div className="w-8 h-8 rounded-lg bg-[var(--primary)] flex items-center justify-center flex-shrink-0">
              <img src="/icon.png" alt="ReplySense" className="w-7 h-7" />
            </div>
            <motion.span
              animate={{
                display: open ? "inline-block" : "none",
                opacity: open ? 1 : 0,
              }}
              className="font-semibold text-[var(--text-primary)] whitespace-pre"
            >
              ReplySense AI
            </motion.span>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-col gap-3" style={{ marginTop: "48px" }}>
            {links.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Logout Button at bottom */}
        <div style={{ paddingBottom: "16px" }}>
          <LogoutButton />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
