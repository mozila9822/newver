import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "admin" | "user" | "guest";

interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

// Default credentials (in a real app, this would be validated against the database)
const VALID_CREDENTIALS = {
  admin: {
    email: "admin@voyager.com",
    password: "admin123",
    name: "Administrator",
    role: "admin" as UserRole
  },
  user: {
    email: "user@voyager.com", 
    password: "user123",
    name: "John Doe",
    role: "user" as UserRole
  }
};

const AUTH_STORAGE_KEY = "voyager_auth_user";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  });
  const { toast } = useToast();

  // Persist user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const login = (email: string, password: string): { success: boolean; error?: string } => {
    // Validate credentials
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      return { success: false, error: "Please enter both email and password" };
    }

    // Check admin credentials
    if (trimmedEmail === VALID_CREDENTIALS.admin.email && trimmedPassword === VALID_CREDENTIALS.admin.password) {
      const adminUser: User = {
        name: VALID_CREDENTIALS.admin.name,
        email: VALID_CREDENTIALS.admin.email,
        role: VALID_CREDENTIALS.admin.role
      };
      setUser(adminUser);
      toast({
        title: `Welcome back, ${adminUser.name}`,
        description: "You are logged in as Administrator.",
      });
      return { success: true };
    }

    // Check user credentials
    if (trimmedEmail === VALID_CREDENTIALS.user.email && trimmedPassword === VALID_CREDENTIALS.user.password) {
      const regularUser: User = {
        name: VALID_CREDENTIALS.user.name,
        email: VALID_CREDENTIALS.user.email,
        role: VALID_CREDENTIALS.user.role
      };
      setUser(regularUser);
      toast({
        title: `Welcome back, ${regularUser.name}`,
        description: "You are logged in as User.",
      });
      return { success: true };
    }

    // Invalid credentials
    return { success: false, error: "Invalid email or password" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    toast({
      title: "Logged out",
      description: "See you soon!",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
