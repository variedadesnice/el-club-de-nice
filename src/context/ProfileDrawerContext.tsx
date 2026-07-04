import React, { createContext, useContext, useState, useCallback } from "react";
import PublicProfile from "../features/profile/components/PublicProfile";

interface ProfileDrawerContextValue {
  openProfile: (userId: string) => void;
}

const ProfileDrawerContext = createContext<ProfileDrawerContextValue>({
  openProfile: () => {},
});

export function useProfileDrawer() {
  return useContext(ProfileDrawerContext);
}

export function ProfileDrawerProvider({ children }: { children: React.ReactNode }) {
  const [openUserId, setOpenUserId] = useState<string | null>(null);

  const openProfile = useCallback((userId: string) => {
    setOpenUserId(userId);
  }, []);

  const close = useCallback(() => {
    setOpenUserId(null);
  }, []);

  return (
    <ProfileDrawerContext.Provider value={{ openProfile }}>
      {children}
      {openUserId && (
        <PublicProfile userId={openUserId} onClose={close} />
      )}
    </ProfileDrawerContext.Provider>
  );
}
