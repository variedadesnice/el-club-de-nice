import React, { lazy } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { isAdmin } from "../lib/permissions";
import Landing from "../features/landing/landing";
import Login from "../features/auth/components/Login";

// Cargados bajo demanda: reducen el bundle inicial que descarga cualquier
// visitante no autenticado (login/landing) a solo lo que realmente se renderiza.
const PostFeed = lazy(() => import("../features/muro/components/PostFeed"));
const Classroom = lazy(() => import("../features/classroom/components/Classroom"));
const Profile = lazy(() => import("../features/profile/components/Profile"));
const LiveView = lazy(() => import("../features/live/components/LiveView"));
const AdminDashboard = lazy(() => import("../features/admin/AdminDashboard"));
const Register = lazy(() => import("../features/auth/components/Register"));
const InviteRegister = lazy(() => import("../features/auth/components/InviteRegister"));
const ForgotPassword = lazy(() => import("../features/auth/components/ForgotPassword"));
const ResetPassword = lazy(() => import("../features/auth/components/ResetPassword"));

function AdminRoute() {
  const { user } = useAuth();
  if (!isAdmin(user?.role)) {
    setTimeout(() => alert("No tienes permisos para acceder al panel de administración."), 0);
    return <Navigate to="/muro" replace />;
  }
  return <AdminDashboard />;
}

function LandingPage() {
  const navigate = useNavigate();
  return (
    <Landing
      onViewChange={(v) => {
        if (v === "login") navigate("/login");
        else if (v === "register") navigate("/register");
      }}
    />
  );
}


function LoginPage() {
  const navigate = useNavigate();
  return (
    <Login
      onGoToRegister={() => navigate("/register")}
      onForgotPassword={() => navigate("/forgot-password")}
    />
  );
}

function ForgotPasswordPage() {
  const navigate = useNavigate();
  return <ForgotPassword onGoToLogin={() => navigate("/login")} />;
}

function ResetPasswordPage() {
  const navigate = useNavigate();
  return (
    <ResetPassword
      onGoToLogin={() => navigate("/login")}
      onGoToForgotPassword={() => navigate("/forgot-password")}
    />
  );
}

function RegisterPage() {
  const navigate = useNavigate();
  return <Register onGoToLogin={() => navigate("/login")} />;
}

function InviteRegisterPage() {
  const navigate = useNavigate();
  return <InviteRegister onGoToLogin={() => navigate("/login")} />;
}

export interface AppRoute {
  path: string;
  element: React.ReactNode;
}

export const authRoutes: AppRoute[] = [
  { path: "/", element: <LandingPage /> },
  // Ruta histórica de la landing: ahora vive en "/", se redirige para no romper enlaces.
  { path: "/landing", element: <Navigate to="/" replace /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/invite", element: <InviteRegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },
];

export const appRoutes: AppRoute[] = [
  { path: "/muro", element: <PostFeed /> },
  { path: "/live", element: <LiveView /> },
  { path: "/classroom", element: <Classroom /> },
  { path: "/profile", element: <Profile /> },
  { path: "/admin", element: <AdminRoute /> },
];
