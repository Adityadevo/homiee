"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { getSocket } from "@/lib/socket";
import { useCurrentUser } from "@/lib/useCurrentUser";
import { getToken } from "@/lib/auth";

export const dynamic = 'force-dynamic';

type Message = {
  _id: string;
  matchId: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  createdAt: string;
};

type MatchData = {
  _id: string;
  sender: { _id: string; name: string; email: string; profilePicture?: string; gender?: string };
  receiver: { _id: string; name: string; email: string; profilePicture?: string; gender?: string };
  listing: { 
    _id: string;
    rent?: number;
    location?: string;
    propertyType?: string;
  };
};

const getProfileImage = (user: { profilePicture?: string; gender?: string }) => {
  if (user.profilePicture && user.profilePicture.trim() !== "") return user.profilePicture;
  return "https://pixabay.com/get/gcc98e3544acdd60d2dbce22da5a8d96635dc4af2d465703464a169c3db289f7c0a3e5ce08c33c230e12ca42599157eb0.svg";
};

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const matchId = params.matchId as string;
  const { user } = useCurrentUser();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load match data and chat history
  useEffect(() => {
    const loadData = async () => {
      try {
        // Get request details directly
        const request = await apiFetch<any>(`/requests/${matchId}`);
        
        if (!request) {
          console.error("Request not found");
          router.push("/matches");
          return;
        }
        
        // Convert request to match data format
        const otherUser = request.sender._id === user?._id ? request.receiver : request.sender;
        
        setMatchData({
          _id: request._id,
          sender: request.sender,
          receiver: request.receiver,
          listing: request.listing
        });
        
        // Get chat history
        const history = await apiFetch<Message[]>(`/chat/${matchId}`);
        setMessages(history);
      } catch (error: any) {
        console.error("Failed to load chat data:", error);
        
        // Check if it's an auth error
        if (error.message?.includes("Session expired") || error.message?.includes("401")) {
          console.log("[Chat] Auth error detected, redirecting to login");
          router.replace("/login");
          return;
        }
        
        // For other errors, go to matches page
        console.log("[Chat] Chat data load failed, redirecting to matches");
        router.push("/matches");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [matchId, router, user]);

  // Socket connection
  useEffect(() => {
    const token = getToken();
    if (!token) {
      console.error("No auth token available for socket connection");
      return;
    }

    // Initialize socket with token
    if (!socketRef.current) {
      socketRef.current = getSocket(token);
    }
    
    const socket = socketRef.current;
    
    if (!socket.connected) {
      socket.connect();
    }

    // Join chat room
    socket.emit("join_chat", matchId);

    // Listen for new messages
    socket.on("new_message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicator
    socket.on("user_typing", ({ isTyping: typing }: { isTyping: boolean }) => {
      setOtherUserTyping(typing);
      if (typing) {
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    return () => {
      socket.emit("leave_chat", matchId);
      socket.off("new_message");
      socket.off("user_typing");
    };
  }, [matchId]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socketRef.current) return;

    const socket = socketRef.current;
    socket.emit("send_message", {
      matchId,
      content: newMessage.trim()
    });

    setNewMessage("");
    setIsTyping(false);
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    
    if (!socketRef.current) return;
    
    const socket = socketRef.current;
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
      socket.emit("typing", { matchId, isTyping: true });
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds
    if (socketRef.current) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        socketRef.current?.emit("typing", { matchId, isTyping: false });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-xl animate-pulse text-gray-700">Loading chat...</div>
      </div>
    );
  }

  if (!matchData) {
    return null;
  }

  const otherUser = 
    matchData.sender.email === user?.email 
      ? matchData.receiver 
      : matchData.sender;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 flex flex-col pb-20">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 px-4 py-3 flex items-center gap-3 fixed top-0 left-0 right-0 z-10">
        <button 
          onClick={() => router.back()}
          className="text-2xl hover:bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center"
        >
          ←
        </button>
        <img 
          src={getProfileImage(otherUser)}
          alt={otherUser.name}
          className="w-10 h-10 rounded-full object-cover border-2 border-purple-200"
        />
        <div className="flex-1">
          <div className="font-bold text-gray-800">{otherUser.name}</div>
          <div className="text-xs text-gray-500">
            {matchData.listing.propertyType} • ₹{matchData.listing.rent}/mo • {matchData.listing.location}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 mt-16 mb-20">
        {messages.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">💬</div>
            <p className="text-gray-600">
              Start the conversation with {otherUser.name}!
            </p>
          </div>
        )}
        
        {messages.map((msg) => {
          const isMe = msg.sender._id === user?._id;
          
          return (
            <div
              key={msg._id}
              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                {!isMe && (
                  <div className="text-xs text-gray-500 mb-1 px-2">
                    {msg.sender.name}
                  </div>
                )}
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isMe
                      ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-sm"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <div
                    className={`text-[10px] mt-1 ${
                      isMe ? "text-pink-100" : "text-gray-400"
                    }`}
                  >
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {otherUserTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2 rounded-bl-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSendMessage}
        className="bg-white border-t border-gray-200 px-4 py-3 flex gap-2 fixed bottom-16 left-0 right-0 z-10"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => handleTyping(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          Send
        </button>
      </form>
    </div>
  );
}
