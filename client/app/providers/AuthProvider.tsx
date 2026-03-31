"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

type AuthUser = {
  id: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const AUTH_STORAGE_KEY = "blog-app-auth";
const AUTH_COOKIE_KEY = "client_auth_token";

const getApiBaseUrl = () => process.env.NEXT_PUBLIC_API_URL?.trim() || "";

const syncAuthCookie = (token: string | null) => {
  if (token) {
    document.cookie = `${AUTH_COOKIE_KEY}=${encodeURIComponent(token)}; path=/; SameSite=Lax`;
    return;
  }

  document.cookie = `${AUTH_COOKIE_KEY}=; path=/; Max-Age=0; SameSite=Lax`;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as {
          user: AuthUser;
          token: string;
        };

        setUser(parsed.user);
        setToken(parsed.token);
        syncAuthCookie(parsed.token);
      }
    } catch (error) {
      console.error(error);
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
      syncAuthCookie(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const persistAuth = (nextUser: AuthUser | null, nextToken: string | null) => {
    setUser(nextUser);
    setToken(nextToken);

    if (nextUser && nextToken) {
      window.localStorage.setItem(
        AUTH_STORAGE_KEY,
        JSON.stringify({ user: nextUser, token: nextToken })
      );
      syncAuthCookie(nextToken);
      return;
    }

    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    syncAuthCookie(null);
  };

  const login = async (email: string, password: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    persistAuth(data.user, data.accessToken);
  };

  const register = async (email: string, password: string) => {
    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName: email,
        username: email,
        email,
        password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    await login(email, password);
  };

  const logout = async () => {
    if (!token) {
      persistAuth(null, null);
      return;
    }

    const response = await fetch(`${getApiBaseUrl()}/api/v1/users/logout`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
    });

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new Error(data?.message || "Logout failed");
    }

    persistAuth(null, null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
