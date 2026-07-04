import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import { useAuth } from "./context/AuthContext";
import Layout from "./shared/layout/Layout";
import AccountStatus from "./features/auth/components/AccountStatus";
import SessionExpired from "./features/auth/components/SessionExpired";
import { needsActiveSubscription, hasActiveSubscription } from "./lib/permissions";
import { authRoutes, appRoutes, AppRoute } from "./routes";
import OnboardingModal, { needsOnboarding, markOnboardingDoneForUser, hasIncompleteProfile } from "./features/onboarding/OnboardingModal";
import { ProfileDrawerProvider } from "./context/ProfileDrawerContext";

function AnimatedRoutes({ routes, fallback }: { routes: AppRoute[]; fallback: string }) {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.2 }}
      >
        <Routes location={location}>
          {routes.map((route) => (
            <Route key={route.path} path={route.path} element={route.element} />
          ))}
          <Route path="*" element={<Navigate to={fallback} replace />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function AppContent() {
  const { user, isAuthenticated, logout, sessionExpired } = useAuth();

  if (sessionExpired) {
    return <SessionExpired />;
  }

  if (!isAuthenticated) {
    return <AnimatedRoutes routes={authRoutes} fallback="/" />;
  }

  if (needsActiveSubscription(user?.role) && !hasActiveSubscription(user?.subscription_status)) {
    return <AccountStatus />;
  }

  return <AuthenticatedApp onLogout={logout} userId={user?.id} />;
}

// Separated so the onboarding state is scoped to authenticated sessions
function AuthenticatedApp({ onLogout, userId }: { onLogout: () => void; userId?: string }) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(
    () => needsOnboarding(userId) && hasIncompleteProfile(user)
  );

  const handleOnboardingComplete = () => {
    if (userId) markOnboardingDoneForUser(userId);
    setShowOnboarding(false);
  };

  return (
    <>
      <ProfileDrawerProvider>
        <Layout onLogout={onLogout}>
          <AnimatedRoutes routes={appRoutes} fallback="/muro" />
        </Layout>
      </ProfileDrawerProvider>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModal onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>
    </>
  );
}

export default function App() {
  const { user } = useAuth();
  return (
    <BrowserRouter>
      <AppContent key={user?.id} />
    </BrowserRouter>
  );
}
