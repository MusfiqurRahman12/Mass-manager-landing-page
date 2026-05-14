import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { authService, type User } from "../services";
import { messService } from "../services/messService";
import { setGlobalCurrency } from "../utils/format.utils";
import { requestAndRegisterPushToken, unregisterPushToken } from "../lib/pushNotifications";
import { queryClient } from "../lib/queryClient";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    fullName: string,
    password: string,
  ) => Promise<boolean>;
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

  // Initialize from localStorage and refresh from server
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

    // Refresh user data from server to get latest role
    const refreshUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const userInfo = await authService.getCurrentUserInfo();
          setUser(userInfo);
          
          if (userInfo.role === "super_admin" as any) {
            console.log("Super admin detected in main auth loop, redirecting to admin portal");
            authService.logout();
            window.location.href = "/admin/dashboard";
            return;
          }
          
          if (userInfo.mess_id) {
            try {
              const messData = await messService.getMess();
              setGlobalCurrency(messData.currency);
            } catch (err) {
              console.error("Failed to fetch mess for currency:", err);
            }
          }
          
          // Check/update push registration on page load/refresh
          _tryRequestPush();
        } catch (error) {
          console.error("Failed to refresh user data:", error);
        }
      }
      setIsLoading(false);
    };

    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Clear any cached data from a previous user before fetching new user's data
    queryClient.clear();
    try {
      await authService.login({ email, password });
      const userInfo = await authService.getCurrentUserInfo();
      setUser(userInfo);
      
      if (userInfo.mess_id) {
        try {
          const messData = await messService.getMess();
          setGlobalCurrency(messData.currency);
        } catch (err) {
          console.error("Failed to fetch mess for currency:", err);
        }
      }

      // Request push permission after successful login (non-blocking)
      _tryRequestPush();
      
      return !!userInfo.mess_id;
    } finally {
      setIsLoading(false);
    }
  };

  // After login succeeds, request push permission in the background
  const _tryRequestPush = () => {
    requestAndRegisterPushToken().catch(() => {/* best effort */});
  };

  const register = async (
    email: string,
    fullName: string,
    password: string,
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const newUser = await authService.register({
        email,
        full_name: fullName,
        password,
      });
      setUser(newUser);
      return !!newUser.mess_id;
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
    unregisterPushToken(); // best-effort token cleanup
    authService.logout();
    setUser(null);
    // Wipe all cached query data so the next user always gets fresh data from the server
    queryClient.clear();
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
