"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface PrivacyContextType {
  isPrivacyEnabled: boolean;
  togglePrivacy: () => void;
}

const PrivacyContext = createContext<PrivacyContextType | undefined>(undefined);

const PRIVACY_STORAGE_KEY = "m3u8_viewer_privacy_enabled";

export function PrivacyProvider({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  const [isPrivacyEnabled, setIsPrivacyEnabled] = useState(false);

  // Load the initial value from localStorage only on the client side
  useEffect(() => {
    const stored = localStorage.getItem(PRIVACY_STORAGE_KEY);
    if (stored !== null) {
      setIsPrivacyEnabled(JSON.parse(stored));
    }
  }, []);

  // Update localStorage when privacy setting changes
  useEffect(() => {
    localStorage.setItem(PRIVACY_STORAGE_KEY, JSON.stringify(isPrivacyEnabled));
  }, [isPrivacyEnabled]);

  const togglePrivacy = (): void => {
    setIsPrivacyEnabled((prev) => !prev);
  };

  return (
    <PrivacyContext.Provider value={{ isPrivacyEnabled, togglePrivacy }}>
      {children}
    </PrivacyContext.Provider>
  );
}

export function usePrivacy(): PrivacyContextType {
  const context = useContext(PrivacyContext);
  if (context === undefined) {
    throw new Error("usePrivacy must be used within a PrivacyProvider");
  }
  return context;
}
