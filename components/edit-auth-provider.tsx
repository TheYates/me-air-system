"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { PinDialog } from "@/components/pin-dialog";
import { setEditAuthHandler } from "@/lib/api";

type EditAuthContextValue = {
  isUnlocked: boolean;
  expiresAt: number | null;
  secondsRemaining: number | null;
  requestUnlock: () => Promise<boolean>;
  lock: () => Promise<void>;
  openPinDialog: () => void;
};

const EditAuthContext = createContext<EditAuthContextValue | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002/api";

export function EditAuthProvider({ children }: { children: React.ReactNode }) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const unlockResolverRef = useRef<((value: boolean) => void) | null>(null);
  const expiredHandledRef = useRef(false);

  const refreshSession = useCallback(async () => {
    const response = await fetch(`${API_URL}/auth/session`, {
      credentials: "include",
    });
    if (!response.ok) {
      setIsUnlocked(false);
      setExpiresAt(null);
      return;
    }

    const data = await response.json();
    setIsUnlocked(Boolean(data.unlocked));
    setExpiresAt(data.expiresAt ?? null);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  useEffect(() => {
    if (!isUnlocked) return;

    const intervalId = setInterval(() => {
      void refreshSession();
    }, 60_000);

    return () => clearInterval(intervalId);
  }, [isUnlocked, refreshSession]);

  const verifyPin = useCallback(async (pin: string) => {
    const response = await fetch(`${API_URL}/auth/verify-pin`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pin }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    setIsUnlocked(true);
    setExpiresAt(data.expiresAt ?? null);
    unlockResolverRef.current?.(true);
    unlockResolverRef.current = null;
    return true;
  }, []);

  const requestUnlock = useCallback(() => {
    if (isUnlocked) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      unlockResolverRef.current = resolve;
      setIsPinDialogOpen(true);
    });
  }, [isUnlocked]);

  const openPinDialog = useCallback(() => {
    unlockResolverRef.current = null;
    setIsPinDialogOpen(true);
  }, []);

  const lock = useCallback(async () => {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    setIsUnlocked(false);
    setExpiresAt(null);
  }, []);

  useEffect(() => {
    setEditAuthHandler(requestUnlock);
    return () => setEditAuthHandler(null);
  }, [requestUnlock]);

  useEffect(() => {
    if (!isUnlocked || !expiresAt) {
      setSecondsRemaining(null);
      expiredHandledRef.current = false;
      return;
    }

    const tick = () => {
      const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
      setSecondsRemaining(remaining);

      if (remaining === 0 && !expiredHandledRef.current) {
        expiredHandledRef.current = true;
        void lock();
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [isUnlocked, expiresAt, lock]);

  const handlePinDialogChange = (open: boolean) => {
    setIsPinDialogOpen(open);
    if (!open && unlockResolverRef.current) {
      unlockResolverRef.current(false);
      unlockResolverRef.current = null;
    }
  };

  return (
    <EditAuthContext.Provider
      value={{
        isUnlocked,
        expiresAt,
        secondsRemaining,
        requestUnlock,
        lock,
        openPinDialog,
      }}
    >
      {children}
      <PinDialog
        open={isPinDialogOpen}
        onOpenChange={handlePinDialogChange}
        onSubmit={verifyPin}
      />
    </EditAuthContext.Provider>
  );
}

export function useEditAuth() {
  const context = useContext(EditAuthContext);
  if (!context) {
    throw new Error("useEditAuth must be used within EditAuthProvider");
  }
  return context;
}
