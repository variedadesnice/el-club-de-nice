import React, { useState, useEffect } from "react";
import { Clock, X, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useAuth } from "../../../context/AuthContext";
import RenewalGateway from "../../auth/components/RenewalGateway";

export default function RenewalBanner() {
  const { user } = useAuth();
  const [showBanner, setShowBanner] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user || !user.subscription_expires_at) {
      setShowBanner(false);
      return;
    }

    // Check if dismissed in this session
    const isDismissed = sessionStorage.getItem(`dismissed_renewal_banner_${user.id}`);
    if (isDismissed) {
      setShowBanner(false);
      return;
    }

    const expiresAt = new Date(user.subscription_expires_at);
    const now = new Date();
    
    // Calculate days remaining
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0 && diffDays <= 5) {
      setDaysRemaining(diffDays);
      setShowBanner(true);
    } else {
      setShowBanner(false);
    }
  }, [user]);

  const handleDismiss = () => {
    if (user) {
      sessionStorage.setItem(`dismissed_renewal_banner_${user.id}`, "1");
    }
    setShowBanner(false);
  };

  if (!showBanner || daysRemaining === null) return null;

  // Colors based on urgency
  let bgGradient = "from-amber-500 to-orange-600";
  let badgeText = "text-orange-600 bg-orange-50";
  
  if (daysRemaining === 1) {
    bgGradient = "from-rose-500 via-red-600 to-rose-700";
    badgeText = "text-rose-600 bg-rose-50";
  } else if (daysRemaining <= 3) {
    bgGradient = "from-orange-500 to-rose-600";
    badgeText = "text-rose-600 bg-rose-50";
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full relative overflow-hidden rounded-3xl p-5 border border-white/10 shadow-lg"
      >
        {/* Background gradient with animated glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient} opacity-95`} />
        
        {/* Background visual shapes */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
          <path d="M0,40 C120,80 240,0 400,60 L400,100 L0,100 Z" fill="currentColor" className="text-white" />
        </svg>

        <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4 z-10">
          <div className="flex items-center gap-4 text-left">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${badgeText} shrink-0 shadow-sm animate-pulse`}>
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div>
              <h4 className="font-black text-white text-base tracking-tight flex items-center gap-1.5">
                Membresía próxima a vencer
                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-white/20 text-white">
                  {daysRemaining} {daysRemaining === 1 ? "día" : "días"}
                </span>
              </h4>
              <p className="text-xs font-bold text-white/95 mt-1 leading-relaxed max-w-xl">
                ⏳ Te quedan {daysRemaining} {daysRemaining === 1 ? "día" : "días"} de tu plan. Renueva hoy para mantener tu racha, tus niveles y tu acceso a la comunidad sin interrupciones.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2.5 rounded-2xl bg-white text-slate-900 text-xs font-black hover:bg-slate-50 active:scale-95 transition-all shadow-md shadow-black/10 flex items-center gap-1.5"
            >
              Renovar ahora <Sparkles size={13} className="text-indigo-600 fill-indigo-100" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Cerrar aviso"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Renewal gateway inside modal */}
      {showModal && (
        <RenewalGateway
          isModal
          onClose={() => {
            setShowModal(false);
          }}
        />
      )}
    </>
  );
}
