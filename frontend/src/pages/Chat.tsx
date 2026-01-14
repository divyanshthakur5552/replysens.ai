import { useState } from "react";
import { AIChatInput } from "@/components/ui/ai-chat-input";
import { useChat } from "@/hooks/useChat";
import {
  ChatHeader,
  ChatWelcome,
  ChatMessage,
  TypingIndicator,
  ChatSidebar,
  ChatError
} from "@/components/chat";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, loading, error, sendMessage, messagesContainerRef, messagesEndRef } = useChat();

  return (
    <div className="h-screen w-full flex bg-[var(--background)]">
      <ChatSidebar open={sidebarOpen} setOpen={setSidebarOpen} />

      <div className="flex-1 flex flex-col bg-[var(--surface)] h-screen overflow-hidden">
        <ChatHeader title="AI Assistant" subtitle="Always here to help" />

        {/* Messages area - scrollable */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto flex justify-center"
        >
          <div className="w-full max-w-3xl px-4 py-8 space-y-4">
            {messages.length === 0 && <ChatWelcome onSuggestionClick={sendMessage} />}
            
            {messages.map((msg, i) => (
              <ChatMessage key={i} message={msg} />
            ))}
            
            {loading && <TypingIndicator />}
            {error && <ChatError message={error} />}
            
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area - fixed at bottom */}
        <div className="shrink-0 bg-[var(--surface)] p-4 flex justify-center">
          <div className="w-full max-w-3xl">
            <AIChatInput onSendMessage={sendMessage} isLoading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
}
