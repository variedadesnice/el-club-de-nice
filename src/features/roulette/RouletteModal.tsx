import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { Gift, RotateCw, X } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import RouletteWheel from "../../shared/ui/RouletteWheel";
import { RoulettePrize, RouletteStatus, RouletteSpinResult } from "../../types";

export default function RouletteModal() {
  const api = useApiFetch();
  const [status, setStatus] = useState<RouletteStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteSpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rotationMV = useMotionValue(0);
  const totalRotationRef = useRef(0);

  useEffect(() => {
    api<RouletteStatus>("/api/roulette/status")
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!status || !status.is_active || status.already_spun_today || dismissed) return null;

  const prizes: RoulettePrize[] = status.prizes;

  async function handleSpin() {
    if (spinning || prizes.length < 2) return;
    setSpinning(true);
    setError(null);
    try {
      const { data } = await api<RouletteSpinResult>("/api/roulette/spin", { method: "POST" });

      const idx = Math.max(0, prizes.findIndex(p => p.id === data.prize_id));
      const n = prizes.length;
      const segDeg = 360 / n;
      const winnerMid = idx * segDeg + segDeg / 2;
      const targetAngle = (360 - (winnerMid % 360)) % 360;
      const currentAngle = totalRotationRef.current % 360;
      const deltaAngle = (targetAngle - currentAngle + 360) % 360;
      const target = totalRotationRef.current + 1440 + deltaAngle;

      await animate(rotationMV, target, { duration: 4.5, ease: [0.2, 1, 0.3, 1] });
      totalRotationRef.current = target;
      setWinner(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo girar la ruleta. Intenta de nuevo más tarde.");
    } finally {
      setSpinning(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      <AnimatePresence mode="wait">
        {!winner ? (
          <motion.div
            key="wheel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-1">🎁 Ruleta diaria</p>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 mb-4">¡Gira y gana un premio!</h2>

            <div className="relative w-full max-w-[260px] aspect-square select-none mx-auto">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 drop-shadow-lg">
                <div
                  className="w-0 h-0"
                  style={{ borderLeft: "12px solid transparent", borderRight: "12px solid transparent", borderTop: "24px solid #4f46e5" }}
                />
              </div>
              <motion.div style={{ rotate: rotationMV }} className="w-full h-full">
                <RouletteWheel prizes={prizes} />
              </motion.div>
            </div>

            {error && (
              <p className="text-xs font-bold text-red-500 mt-4">{error}</p>
            )}

            <button
              onClick={handleSpin}
              disabled={spinning}
              className="mt-6 flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed mx-auto"
            >
              <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
              {spinning ? "Girando..." : "¡Girar!"}
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
          >
            <button
              onClick={() => setDismissed(true)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <motion.div
              initial={{ scale: 0.5, rotate: -15 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
              className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center shadow-2xl"
              style={{ backgroundColor: winner.color }}
            >
              <Gift size={42} className="text-white" />
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">¡Ganaste!</p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 break-words">{winner.label}</h2>
              <p className="text-xs font-medium text-slate-400 mt-3">Vuelve mañana para girar de nuevo.</p>
            </motion.div>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.35 }}
              onClick={() => setDismissed(true)}
              className="mt-7 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors text-sm shadow-lg shadow-indigo-100"
            >
              Cerrar
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
