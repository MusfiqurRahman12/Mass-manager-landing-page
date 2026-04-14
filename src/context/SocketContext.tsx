import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import type { Message, Notification } from "../services";

interface SocketContextType {
  socket: Socket | null;
  messages: Message[];
  notifications: Notification[];
  isConnected: boolean;
  sendMessage: (text: string) => void;
  markNotificationAsRead: (id: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [isConnected, setIsConnected] = React.useState(false);

  useEffect(() => {
    const wsUrl = import.meta.env.VITE_WS_URL || "http://localhost:3000";
    const token = localStorage.getItem("token");

    if (!token) return;

    socketRef.current = io(wsUrl, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    socketRef.current.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected");
    });

    socketRef.current.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socketRef.current.on("message:new", (message: Message) => {
      setMessages((prev) => [message, ...prev]);
    });

    socketRef.current.on("notification:new", (notification: Notification) => {
      setNotifications((prev) => [notification, ...prev]);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const sendMessage = (text: string) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit("chat:send", { text });
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        messages,
        notifications,
        isConnected,
        sendMessage,
        markNotificationAsRead,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}
