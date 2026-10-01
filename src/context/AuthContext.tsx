import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./ToastContext";

export interface UserAddress {
  id: string;
  label: string; // e.g. "Home", "Office"
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  tier: "NOIR VIP" | "GOLD" | "SILVER" | "MEMBER";
  points: number;
  totalSpentCents: number;
  ordersCount: number;
  addresses: UserAddress[];
  joinedAt: string;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "register";
  login: (email: string, pass: string) => Promise<boolean>;
  register: (name: string, email: string, phone: string, pass: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<UserAddress, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "apparrel_customer_session_v2";

const DEFAULT_DEMO_USER: UserProfile = {
  id: "USR-99410",
  name: "Kofi Mensah",
  email: "kofi.mensah@example.com",
  phone: "+233 24 412 9902",
  tier: "NOIR VIP",
  points: 1450,
  totalSpentCents: 489000,
  ordersCount: 4,
  joinedAt: "2025-11-15T10:00:00Z",
  addresses: [
    {
      id: "addr-1",
      label: "Primary Residence",
      recipientName: "Kofi Mensah",
      phone: "+233 24 412 9902",
      street: "14 Independence Avenue, Airport Residential",
      city: "Accra",
      region: "Greater Accra",
      isDefault: true,
    },
    {
      id: "addr-2",
      label: "Studio Office",
      recipientName: "Kofi Mensah",
      phone: "+233 20 891 0023",
      street: "8 Senatorial Loop, Cantonments",
      city: "Accra",
      region: "Greater Accra",
      isDefault: false,
    },
  ],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    // Default logged in demo luxury user
    return DEFAULT_DEMO_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<"login" | "register">("login");
  const { success, info, error } = useToast();

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user]);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, _pass: string): Promise<boolean> => {
    // Instant client validation & demo account matching
    if (!email || !email.includes("@")) {
      error("Invalid Email", "Please enter a valid email address.");
      return false;
    }

    const newUser: UserProfile = {
      ...DEFAULT_DEMO_USER,
      email: email.trim().toLowerCase(),
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    };

    setUser(newUser);
    success("Welcome Back", `Signed in as ${newUser.name} (${newUser.tier})`);
    closeAuthModal();
    return true;
  };

  const register = async (name: string, email: string, phone: string, _pass: string): Promise<boolean> => {
    if (!name || !email || !phone) {
      error("Missing Information", "Please fill in all registration fields.");
      return false;
    }

    const created: UserProfile = {
      id: `USR-${Math.floor(10000 + Math.random() * 90000)}`,
      name,
      email: email.trim().toLowerCase(),
      phone,
      tier: "MEMBER",
      points: 250, // Welcome bonus points
      totalSpentCents: 0,
      ordersCount: 0,
      joinedAt: new Date().toISOString(),
      addresses: [],
    };

    setUser(created);
    success("Account Created", "Welcome to APPARREL Club! You received 250 bonus reward points.");
    closeAuthModal();
    return true;
  };

  const logout = () => {
    setUser(null);
    info("Signed Out", "You have been safely signed out.");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data });
    success("Profile Updated", "Your account settings have been saved.");
  };

  const addAddress = (address: Omit<UserAddress, "id">) => {
    if (!user) return;
    const newAddr: UserAddress = {
      ...address,
      id: `addr-${Date.now()}`,
    };
    const updated = address.isDefault
      ? user.addresses.map((a) => ({ ...a, isDefault: false }))
      : [...user.addresses];
    setUser({ ...user, addresses: [...updated, newAddr] });
    success("Address Added", `Added "${address.label}" to saved addresses.`);
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    setUser({ ...user, addresses: user.addresses.filter((a) => a.id !== id) });
    info("Address Removed", "Saved address was deleted.");
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    setUser({
      ...user,
      addresses: user.addresses.map((a) => ({ ...a, isDefault: a.id === id })),
    });
    success("Default Set", "Primary delivery address updated.");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAuthModalOpen,
        openAuthModal,
        closeAuthModal,
        authModalMode,
        login,
        register,
        logout,
        updateProfile,
        addAddress,
        removeAddress,
        setDefaultAddress,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
