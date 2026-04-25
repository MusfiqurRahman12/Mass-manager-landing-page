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
          
          if (userInfo.mess_id) {
            try {
              const messData = await messService.getMess();
              setGlobalCurrency(messData.currency);
            } catch (err) {
              console.error("Failed to fetch mess for currency:", err);
            }
          }
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
      
      return !!userInfo.mess_id;
    } finally {
      setIsLoading(false);
    }
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
