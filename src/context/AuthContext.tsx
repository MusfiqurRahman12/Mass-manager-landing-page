import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { authService } from "../services";

interface User {
  id: string;
  email: string;
  full_name: string;
  role: "member" | "manager";
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    email: string,
    fullName: string,
    password: string,
  ) => Promise<void>;
  createMess: (
    name: string,
    address: string,
    automaticMarketDate: string,
  ) => Promise<void>;
  joinMess: (messId: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user:", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await authService.login({ email, password });
      const userInfo = await authService.getCurrentUserInfo();
      setUser(userInfo);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    email: string,
    fullName: string,
    password: string,
  ) => {
    setIsLoading(true);
    try {
      const newUser = await authService.register({
        email,
        full_name: fullName,
        password,
      });
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const createMess = async (
    name: string,
    address: string,
    automaticMarketDate: string,
  ) => {
    setIsLoading(true);
    try {
      await authService.createMess({
        name,
        address,
        automatic_market_date: automaticMarketDate,
      });
      const userInfo = await authService.getCurrentUserInfo();
      setUser(userInfo);
    } finally {
      setIsLoading(false);
    }
  };

  const joinMess = async (messId: string) => {
    setIsLoading(true);
    try {
      await authService.joinMess(messId);
      const userInfo = await authService.getCurrentUserInfo();
      setUser(userInfo);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        createMess,
        joinMess,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
