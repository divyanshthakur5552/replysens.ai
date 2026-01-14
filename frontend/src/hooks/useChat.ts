import { useState, useRef, useEffect, useCallback } from "react";
import axios from "axios";
import type { Message } from "@/components/chat/ChatMessage";

const API_URL = "http://localhost:8000";

const getAuthToken = () => localStorage.getItem("token");

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [contextLoaded, setContextLoaded] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesContainerRef.current?.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }, 100);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Load context on mount
  useEffect(() => {
    const loadContext = async () => {
      const token = getAuthToken();
      if (!token) return;
      
      try {
        await axios.post(`${API_URL}/context/load`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setContextLoaded(true);
      } catch (err) {
        console.error("Failed to load context:", err);
      }
    };
    
    loadContext();
  }, []);

  const sendMessage = useCallback(async (input: string) => {
    if (!input.trim()) return;

    const token = getAuthToken();
    if (!token) {
      setError("Not authenticated");
      return;
    }

    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/chat`, { message: input }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const aiMsg: Message = { role: "assistant", content: res.data.reply };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    messages,
    loading,
    error,
    sendMessage,
    messagesContainerRef,
    messagesEndRef,
    contextLoaded
  };
}
