import React, { useEffect, useState } from "react";
import logo from "../../../assets/logo.png";
import avatar1 from "../../../assets/avatars/auth1.jpg";
import avatar2 from "../../../assets/avatars/auth2.jpg";
import avatar3 from "../../../assets/avatars/auth3.jpg";
import avatar4 from "../../../assets/avatars/auth4.jpg";
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from "lucide-react";
import PasswordInput from "../../../shared/ui/PasswordInput";
import { motion, AnimatePresence } from "motion/react";
import { apiFetch } from "../../../lib/api";

interface ResetPasswordProps {
  onGoToLogin: () => void;
  onGoToForgotPassword: () => void;
}

function useRecoveryToken() {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Supabase redirige aca con #access_token=...&type=recovery en el hash tras
    // verificar el enlace de recuperacion (no es query string).
    const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
    const params = new URLSearchParams(hash);
    const token = params.get("access_token");
    const type = params.get("type");
    setAccessToken(token && type === "recovery" ? token : null);
    setChecked(true);
  }, []);

  return { accessToken, checked };
}

export default function ResetPassword({ onGoToLogin, onGoToForgotPassword }: ResetPasswordProps) {
  const { accessToken, checked } = useRecoveryToken();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (!accessToken) return;

    setIsLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_token: accessToken, new_password: password }),
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de conexión. Intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[1000px] grid grid-cols-1 md:grid-cols-12 gap-6"
      >
        {/* Left Side: Branding */}
        <div className="hidden md:flex md:col-span-7 bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden flex-col justify-between min-h-[400px]">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/20 to-transparent"></div>
          <div className="absolute -top-24 -left-24 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <div className="flex items-center space-x-3 mb-12">
              <img src={logo} alt="Logo" className="w-12 h-12 object-contain" />
              <span className="font-bold text-2xl tracking-tight">El Club de Nice</span>
            </div>
            <h1 className="text-5xl font-black mb-6 leading-[1.1] tracking-tight">Crea tu<br />nueva<br />contraseña.</h1>
            <p className="text-slate-400 text-lg font-medium max-w-sm">
              Elige una contraseña segura para volver a acceder a tu cuenta y a todos tus beneficios.
            </p>
          </div>

          <div className="relative z-10 flex -space-x-3 mt-12">
            {[avatar1, avatar2, avatar3, avatar4].map((avatar, i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 shadow-sm overflow-hidden">
                <img src={avatar} alt="user" />
              </div>
            ))}
            <div className="w-12 h-12 rounded-full border-4 border-slate-900 bg-indigo-600 text-[10px] flex items-center justify-center font-bold text-white shadow-sm">
              +2k
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:col-span-5 bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-sm flex flex-col justify-center">
          <div className="flex md:hidden items-center gap-3 mb-8">
            <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
            <span className="font-bold text-xl tracking-tight text-slate-900">El Club de Nice</span>
          </div>

          <AnimatePresence mode="wait">
            {!checked ? (
              <motion.div key="checking" className="py-10 text-center text-slate-400 font-medium text-sm">
                Verificando enlace...
              </motion.div>
            ) : !accessToken ? (
              <motion.div
                key="invalid"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-5">
                  <ShieldAlert size={28} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">Enlace inválido o expirado</h2>
                <p className="text-sm font-medium text-slate-500 mb-8">
                  Este enlace de recuperación ya no es válido. Solicita uno nuevo para continuar.
                </p>
                <button
                  onClick={onGoToForgotPassword}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                >
                  Solicitar nuevo enlace <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center text-center"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mb-5">
                  <CheckCircle2 size={28} />
                </div>
                <h2 className="text-xl font-black text-slate-900 mb-2">¡Contraseña actualizada!</h2>
                <p className="text-sm font-medium text-slate-500 mb-8">
                  Ya puedes iniciar sesión con tu nueva contraseña.
                </p>
                <button
                  onClick={onGoToLogin}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98]"
                >
                  Iniciar sesión <ArrowRight size={18} />
                </button>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <h2 className="text-2xl font-black text-slate-900 mb-2">Nueva contraseña</h2>
                <p className="text-sm font-medium text-slate-500 mb-8">
                  Elige una contraseña nueva para tu cuenta.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Nueva contraseña</label>
                    <PasswordInput
                      required
                      value={password}
                      onChange={setPassword}
                      autoComplete="new-password"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Confirmar contraseña</label>
                    <PasswordInput
                      required
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      autoComplete="new-password"
                    />
                  </div>

                  {error && (
                    <motion.p
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm text-red-500 font-medium bg-red-50 px-4 py-3 rounded-xl"
                    >
                      {error}
                    </motion.p>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>Guardar nueva contraseña <ArrowRight size={18} /></>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 flex flex-col items-center">
                  <button onClick={onGoToLogin} className="text-sm font-bold text-indigo-600 hover:underline flex items-center gap-1.5">
                    <ArrowLeft size={14} /> Volver a iniciar sesión
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
