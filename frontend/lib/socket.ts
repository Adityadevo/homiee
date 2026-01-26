// lib/socket.ts
import socketIOClient from "socket.io-client";

let socket: ReturnType<typeof socketIOClient> | null = null;

export function getSocket(token?: string): ReturnType<typeof socketIOClient> {
  const authToken = token || (typeof window !== "undefined" ? localStorage.getItem("rommie_token") : null);
  
  if (!socket) {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    
    socket = socketIOClient(API_URL, {
      auth: {
        token: authToken
      },
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected");
    });

    socket.on("connect_error", (error: Error) => {
      console.error("❌ Socket connection error:", error.message);
    });

    socket.on("error", (error: any) => {
      console.error("❌ Socket error:", error);
    });
  }

  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
