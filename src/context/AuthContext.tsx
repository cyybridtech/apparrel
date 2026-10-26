import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "./ToastContext";
import { authLogin, authRegister, fetchCurrentUser, User } from "../lib/api";

export interface UserAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  street: string;
  city: string;
  region: string;
  isDefault: boolean;
}

export interface UserProfile extends User {
  addresses?: UserAddress[];
  rewardPoints?: number;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSeller: boolean;
  isCustomer: boolean;
  isAuthModalOpen: boolean;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  authModalMode: "login" | "register";
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    region?: string;
  }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addAddress: (address: Omit<UserAddress, "id">) => void;
  removeAddress: (id: string) => void;
  setDefaultAddress: (id: string) => void;
  addRewardPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = "cyybrid_user_session_v3";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(USER_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return null;
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

  // Verify session on mount
  useEffect(() => {
    const token = localStorage.getItem("cyybrid_session_token");
    if (token) {
      fetchCurrentUser()
        .then((fetched) => {
          if (fetched) {
            setUser((prev) => ({ ...(prev || {}), ...fetched }));
          } else {
            setUser(null);
          }
        })
        .catch(() => {});
    }
  }, []);

  const openAuthModal = (mode: "login" | "register" = "login") => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => setIsAuthModalOpen(false);

  const login = async (email: string, pass: string): Promise<boolean> => {
    if (!email || email.trim().length < 3 || !email.includes("@")) {
      error("Email Required", "Please enter your email address.");
      return false;
    }
    if (!pass) {
      error("Password Required", "Please enter your password.");
      return false;
    }

    try {
      const res = await authLogin(email.trim(), pass);
      if (res.success && res.user) {
        setUser(res.user);
        success("Signed In", `Welcome back, ${res.user.name}.`);
        closeAuthModal();
        return true;
      }
      return false;
    } catch (err: any) {
      error("Login Failed", err.message || "Invalid credentials. Please try again.");
      return false;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
    city?: string;
    region?: string;
  }): Promise<boolean> => {
    if (!data.name || data.name.trim().length < 2) {
      error("Missing Name", "Please provide your full name.");
      return false;
    }
    if (!data.email || !data.email.includes("@")) {
      error("Invalid Email", "Please provide a valid email address.");
      return false;
    }
    if (!data.phone || data.phone.trim().length < 7) {
      error("Invalid Phone", "Please provide a valid phone number.");
      return false;
    }
    if (!data.password || data.password.length < 12) {
      error("Weak Password", "Password must be at least 12 characters.");
      return false;
    }

    try {
      const res = await authRegister(data);
      if (res.success && res.user) {
        setUser(res.user);
        success("Account Created", `Welcome to Cyybrid Marketplace, ${res.user.name}!`);
        closeAuthModal();
        return true;
      }
      return false;
    } catch (err: any) {
      error("Registration Error", err.message || "Failed to create account.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("cyybrid_session_token");
    localStorage.removeItem("cyybrid_role");
    localStorage.removeItem("cyybrid_seller_id");
    localStorage.removeItem("cyybrid_user");
    setUser(null);
    info("Signed Out", "You have been securely signed out.");
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...data });
    success("Profile Updated", "Your account settings have been saved.");
  };

  const addAddress = (address: Omit<UserAddress, "id">) => {
    if (!user) return;
    const addresses = user.addresses || [];
    const isDefault = address.isDefault || addresses.length === 0;
    const nextAddress: UserAddress = {
      ...address,
      id: globalThis.crypto?.randomUUID?.() || `address-${Date.now()}`,
      isDefault,
    };
    setUser({
      ...user,
      addresses: [
        ...addresses.map((item) => ({ ...item, isDefault: isDefault ? false : item.isDefault })),
        nextAddress,
      ],
    });
  };

  const removeAddress = (id: string) => {
    if (!user) return;
    const addresses = (user.addresses || []).filter((address) => address.id !== id);
    if (!addresses.some((address) => address.isDefault) && addresses.length > 0) {
      addresses[0] = { ...addresses[0], isDefault: true };
    }
    setUser({ ...user, addresses });
  };

  const setDefaultAddress = (id: string) => {
    if (!user) return;
    setUser({
      ...user,
      addresses: (user.addresses || []).map((address) => ({ ...address, isDefault: address.id === id })),
    });
  };

  const addRewardPoints = (points: number) => {
    if (!user || !Number.isFinite(points) || points <= 0) return;
    setUser({ ...user, rewardPoints: (user.rewardPoints || 0) + Math.floor(points) });
  };

  const role = user?.role || "customer";

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        isAdmin: role === "admin",
        isSeller: role === "seller",
        isCustomer: role === "customer",
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
        addRewardPoints,
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
