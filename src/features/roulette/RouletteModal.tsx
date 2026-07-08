import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { Gift, RotateCw, X, Sparkles, PartyPopper, Eye } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import RouletteWheel from "../../shared/ui/RouletteWheel";
import { RoulettePrize, RouletteStatus, RouletteSpinResult } from "../../types";

const CONFETTI_COLORS = ["#f59e0b", "#6366f1", "#ec4899", "#10b981", "#3b82f6", "#f97316"];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 24 }).map((_, i) => ({
        id: i,
        angle: (i / 24) * 360 + Math.random() * 12,
        distance: 90 + Math.random() * 90,
        size: 5 + Math.random() * 5,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        delay: Math.random() * 0.15,
      })),
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {pieces.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const x = Math.cos(rad) * p.distance;
        const y = Math.sin(rad) * p.distance;
        return (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{ x, y, opacity: 0, scale: 1, rotate: 180 }}
            transition={{ duration: 1.1, delay: p.delay, ease: "easeOut" }}
            className="absolute rounded-sm"
            style={{ width: p.size, height: p.size, backgroundColor: p.color }}
          />
        );
      })}
    </div>
  );
}

function pickWeighted(prizes: RoulettePrize[]): RoulettePrize {
  const total = prizes.reduce((sum, p) => sum + (p.weight ?? 1), 0);
  let r = Math.random() * total;
  for (const p of prizes) {
    r -= p.weight ?? 1;
    if (r <= 0) return p;
  }
  return prizes[prizes.length - 1];
}

interface RouletteModalProps {
  /** Modo admin: pasa los premios en edición y no cuenta como giro real (sin llamar al backend, sin límite diario). */
  previewPrizes?: RoulettePrize[];
  /** Requerido en modo preview: el admin puede cerrar en cualquier momento. */
  onClose?: () => void;
}

export default function RouletteModal({ previewPrizes, onClose }: RouletteModalProps = {}) {
  const isPreview = !!previewPrizes;
  const api = useApiFetch();
  const [status, setStatus] = useState<RouletteStatus | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RouletteSpinResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const rotationMV = useMotionValue(0);
  const totalRotationRef = useRef(0);

  useEffect(() => {
    if (isPreview) return;
    api<RouletteStatus>("/api/roulette/status")
      .then(({ data }) => setStatus(data))
      .catch(() => setStatus(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isPreview && (!status || !status.is_active || status.already_spun_today || dismissed)) return null;
  if (isPreview && dismissed) return null;

  const prizes: RoulettePrize[] = isPreview ? previewPrizes! : status!.prizes;

  function handleClose() {
    if (onClose) onClose();
    else setDismissed(true);
  }

  async function handleSpin() {
    if (spinning || prizes.length < 2) return;
    setSpinning(true);
    setError(null);
    try {
      const data: RouletteSpinResult = isPreview
        ? (() => {
            const picked = pickWeighted(prizes);
            return { prize_id: picked.id, label: picked.label, color: picked.color };
          })()
        : (await api<RouletteSpinResult>("/api/roulette/spin", { method: "POST" })).data;

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={isPreview ? handleClose : undefined}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      <AnimatePresence mode="wait">
        {!winner ? (
          <motion.div
            key="wheel"
            initial={{ scale: 0.9, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2rem] max-w-md sm:max-w-lg w-full shadow-2xl text-center overflow-hidden my-8"
          >
            {isPreview && (
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 z-30 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Cerrar vista previa"
              >
                <X size={18} />
              </button>
            )}

            {/* Header banner */}
            <div className="relative overflow-hidden bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 px-6 sm:px-10 pt-8 pb-14">
              <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
                <path d="M0,40 C120,80 240,0 400,60 L400,100 L0,100 Z" fill="currentColor" className="text-white" />
              </svg>
              {isPreview ? (
                <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-black uppercase tracking-widest text-white">
                  <Eye size={12} /> Vista previa — así lo ven los miembros
                </div>
              ) : (
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                  className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-[11px] font-black uppercase tracking-widest text-white"
                >
                  <Sparkles size={12} /> Ruleta diaria
                </motion.div>
              )}
              <h2 className="relative text-2xl sm:text-3xl font-black text-white mt-3 tracking-tight drop-shadow-sm">
                ¡Gira y gana un premio!
              </h2>
              <p className="relative text-xs sm:text-sm font-bold text-white/85 mt-1.5">
                {isPreview
                  ? "Puedes girar todas las veces que quieras — no cuenta como giro real."
                  : "Tienes un giro gratis hoy — no se repite hasta mañana."}
              </p>
            </div>

            {/* Wheel */}
            <div className="px-6 sm:px-10 pb-8 sm:pb-10 -mt-8">
              <div className="relative w-full max-w-[300px] sm:max-w-[360px] aspect-square select-none mx-auto">
                {/* Glow ring */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-indigo-300/50 via-fuchsia-200/40 to-amber-200/40 blur-2xl" />

                <div className="absolute top-1 left-1/2 -translate-x-1/2 -translate-y-2 z-10 drop-shadow-lg">
                  <div
                    className="w-0 h-0"
                    style={{ borderLeft: "15px solid transparent", borderRight: "15px solid transparent", borderTop: "30px solid #4f46e5" }}
                  />
                </div>

                <div className="relative bg-white rounded-full shadow-xl ring-4 ring-slate-50">
                  <motion.div style={{ rotate: rotationMV }} className="w-full h-full">
                    <RouletteWheel prizes={prizes} />
                  </motion.div>
                </div>
              </div>

              {error && (
                <p className="text-xs font-bold text-red-500 mt-5">{error}</p>
              )}

              <motion.button
                onClick={handleSpin}
                disabled={spinning}
                animate={spinning ? {} : { scale: [1, 1.035, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                className="mt-7 flex items-center gap-2.5 bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black text-base hover:bg-indigo-700 active:scale-95 transition-colors shadow-xl shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:animate-none mx-auto"
              >
                <RotateCw size={20} className={spinning ? "animate-spin" : ""} />
                {spinning ? "Girando..." : "¡Girar ahora!"}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="winner"
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-white rounded-[2rem] max-w-md w-full shadow-2xl text-center overflow-hidden my-8"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 z-20 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative bg-gradient-to-br from-amber-50 via-white to-indigo-50 pt-10 pb-4 px-8">
              <Confetti />

              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="relative w-28 h-28 rounded-full mx-auto flex items-center justify-center shadow-2xl ring-8 ring-white"
                style={{ backgroundColor: winner.color }}
              >
                <Gift size={48} className="text-white" />
                <motion.div
                  animate={{ rotate: [0, 15, -15, 0] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="absolute -top-2 -right-2 w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center text-amber-500"
                >
                  <PartyPopper size={18} />
                </motion.div>
              </motion.div>
            </div>

            <div className="px-8 pb-8 pt-2">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mb-2">
                  {isPreview ? "Vista previa — resultado" : "🎉 ¡Ganaste!"}
                </p>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 break-words">{winner.label}</h2>
                <p className="text-xs sm:text-sm font-medium text-slate-400 mt-3">
                  {isPreview ? "Cierra cuando quieras y sigue ajustando los premios." : "Vuelve mañana para girar de nuevo."}
                </p>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={handleClose}
                className="mt-7 px-10 py-3.5 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors text-sm shadow-xl shadow-indigo-100"
              >
                ¡Genial!
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
