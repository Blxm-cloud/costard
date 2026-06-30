"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { DiscordBotUser, DiscordGuildSummary } from "@/lib/discord";
import { clearPersistedToken, persistEncryptedToken, readPersistedToken } from "@/lib/crypto";

interface VerifyResult {
  bot: DiscordBotUser;
  guilds: DiscordGuildSummary[];
}

interface BotTokenContextValue {
  token: string | null;
  bot: DiscordBotUser | null;
  guilds: DiscordGuildSummary[];
  isVerifying: boolean;
  error: string | null;
  verifyAndSet: (token: string) => Promise<boolean>;
  logout: () => void;
}

const BotTokenContext = createContext<BotTokenContextValue | null>(null);

export function BotTokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [bot, setBot] = useState<DiscordBotUser | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuildSummary[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifyAndSet = useCallback(async (candidate: string) => {
    setIsVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/verify-bot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: candidate }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message ?? "Token invalide.");
        return false;
      }
      const result = data as VerifyResult;
      setToken(candidate);
      setBot(result.bot);
      setGuilds(result.guilds);
      persistEncryptedToken(candidate);
      return true;
    } catch {
      setError("Impossible de contacter l'API. Vérifie ta connexion.");
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setBot(null);
    setGuilds([]);
    setError(null);
    clearPersistedToken();
  }, []);

  // Attempt silent re-hydration within the same tab session only.
  useEffect(() => {
    const persisted = readPersistedToken();
    if (persisted) {
      void verifyAndSet(persisted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo(
    () => ({ token, bot, guilds, isVerifying, error, verifyAndSet, logout }),
    [token, bot, guilds, isVerifying, error, verifyAndSet, logout]
  );

  return <BotTokenContext.Provider value={value}>{children}</BotTokenContext.Provider>;
}

export function useBotToken() {
  const ctx = useContext(BotTokenContext);
  if (!ctx) throw new Error("useBotToken must be used within BotTokenProvider");
  return ctx;
}
