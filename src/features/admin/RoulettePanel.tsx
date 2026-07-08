import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { Gift, Plus, RotateCw, Trash2, Trophy, X, History, Power, Eye } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import RouletteWheel from "../../shared/ui/RouletteWheel";
import RouletteModal from "../roulette/RouletteModal";
import { RoulettePrize, RouletteSpinHistoryItem } from "../../types";

const PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#f97316", "#14b8a6",
  "#ec4899", "#84cc16", "#06b6d4", "#a855f7",
];

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

export default function RoulettePanel() {
  const api = useApiFetch();
  const [prizes, setPrizes] = useState<RoulettePrize[]>([]);
  const [isActive, setIsActive] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingActive, setTogglingActive] = useState(false);

  const [newPrize, setNewPrize] = useState("");
  const [newWeight, setNewWeight] = useState(1);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<RoulettePrize | null>(null);

  const [history, setHistory] = useState<RouletteSpinHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [showUserPreview, setShowUserPreview] = useState(false);

  const rotationMV = useMotionValue(0);
  const totalRotationRef = useRef(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api<{ is_active: boolean; prizes: RoulettePrize[] }>("/api/admin/roulette/");
      setIsActive(data.is_active);
      setPrizes(data.prizes);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar la ruleta");
    } finally {
      setLoading(false);
    }
  }, [api]);

  const loadHistory = useCallback(async () => {
    try {
      const { data } = await api<RouletteSpinHistoryItem[]>("/api/admin/roulette/spins?limit=20");
      setHistory(data);
    } catch {
      /* silencioso, seccion secundaria */
    } finally {
      setHistoryLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); loadHistory(); }, [load, loadHistory]);

  async function toggleActive() {
    setTogglingActive(true);
    setError(null);
    try {
      const { data } = await api<{ is_active: boolean; prizes: RoulettePrize[] }>("/api/admin/roulette/", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !isActive }),
      });
      setIsActive(data.is_active);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar la ruleta");
    } finally {
      setTogglingActive(false);
    }
  }

  async function addPrize() {
    const label = newPrize.trim();
    if (!label || prizes.length >= 12) return;
    setError(null);
    try {
      const { data } = await api<RoulettePrize>("/api/admin/roulette/prizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label, color: PALETTE[prizes.length % PALETTE.length], weight: newWeight }),
      });
      setPrizes(prev => [...prev, data]);
      setNewPrize("");
      setNewWeight(1);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al agregar premio");
    }
  }

  async function removePrize(id: string) {
    if (prizes.length <= 2) return;
    setError(null);
    try {
      await api(`/api/admin/roulette/prizes/${id}`, { method: "DELETE" });
      setPrizes(prev => prev.filter(p => p.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar premio");
    }
  }

  async function updatePrize(id: string, patch: { label?: string; weight?: number }) {
    setPrizes(prev => prev.map(p => (p.id === id ? { ...p, ...patch } : p)));
    try {
      await api(`/api/admin/roulette/prizes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar premio");
      load();
    }
  }

  // Preview client-side: no cuenta como giro real, no llama al backend de spin.
  async function previewSpin() {
    if (spinning || prizes.length < 2) return;
    setSpinning(true);
    setWinner(null);

    const n = prizes.length;
    const winnerIdx = Math.floor(Math.random() * n);
    const segDeg = 360 / n;
    const winnerMid = winnerIdx * segDeg + segDeg / 2;

    const targetAngle = (360 - (winnerMid % 360)) % 360;
    const currentAngle = totalRotationRef.current % 360;
    const deltaAngle = (targetAngle - currentAngle + 360) % 360;
    const target = totalRotationRef.current + 1440 + deltaAngle;

    await animate(rotationMV, target, { duration: 4.5, ease: [0.2, 1, 0.3, 1] });

    totalRotationRef.current = target;
    setWinner(prizes[winnerIdx]);
    setSpinning(false);
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24 text-slate-400">
        <RotateCw size={22} className="animate-spin mr-3" />
        <span className="font-bold">Cargando ruleta...</span>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {/* Toggle activo/inactivo */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <Power size={18} className={isActive ? "text-emerald-500" : "text-slate-400"} /> Ruleta {isActive ? "activa" : "inactiva"}
          </h3>
          <p className="text-slate-400 font-medium text-xs sm:text-sm mt-1">
            {isActive
              ? "Los miembros con suscripción activa la ven una vez al día al entrar a la app."
              : "Los miembros no ven la ruleta mientras esté desactivada."}
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setShowUserPreview(true)}
            disabled={prizes.length < 2}
            title={prizes.length < 2 ? "Agrega al menos 2 premios para previsualizar" : undefined}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs sm:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye size={15} /> Ver cómo lo verían los usuarios
          </button>
          <button
            onClick={toggleActive}
            disabled={togglingActive}
            className={`relative w-14 h-8 rounded-full transition-colors shrink-0 ${isActive ? "bg-emerald-500" : "bg-slate-300"} disabled:opacity-50`}
          >
            <motion.div
              animate={{ x: isActive ? 24 : 4 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
            />
          </button>
        </div>
      </div>

      {showUserPreview && (
        <RouletteModal previewPrizes={prizes} onClose={() => setShowUserPreview(false)} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wheel side (preview) */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 justify-center">
              <Gift className="text-indigo-600" size={20} /> Ruleta de Premios
            </h3>
            <p className="text-slate-400 font-medium text-sm mt-1">
              {prizes.length < 2 ? "Agrega al menos 2 premios para probar" : `${prizes.length} premios · vista previa (no cuenta como giro real)`}
            </p>
          </div>

          <div className="relative w-full max-w-[320px] aspect-square select-none">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 drop-shadow-lg">
              <div
                className="w-0 h-0"
                style={{ borderLeft: "14px solid transparent", borderRight: "14px solid transparent", borderTop: "28px solid #4f46e5" }}
              />
            </div>
            <motion.div style={{ rotate: rotationMV }} className="w-full h-full">
              <RouletteWheel prizes={prizes} />
            </motion.div>
          </div>

          <button
            onClick={previewSpin}
            disabled={spinning || prizes.length < 2}
            className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Girando..." : "Probar (vista previa)"}
          </button>
        </div>

        {/* Prize editor side */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-indigo-600" /> Configurar Premios
            </h4>
            <p className="text-slate-400 text-sm font-medium mt-1">
              El peso define la probabilidad relativa (mayor peso = más chance). Se guarda automáticamente.
            </p>
          </div>

          <form onSubmit={e => { e.preventDefault(); addPrize(); }} className="flex gap-2">
            <input
              type="text"
              value={newPrize}
              onChange={e => setNewPrize(e.target.value)}
              placeholder="Nombre del premio..."
              maxLength={30}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
            />
            <input
              type="number"
              min={1}
              max={1000}
              value={newWeight}
              onChange={e => setNewWeight(Math.max(1, Math.min(1000, Number(e.target.value))))}
              title="Peso"
              className="w-16 shrink-0 bg-slate-50 border border-slate-200 rounded-xl px-2 py-2.5 text-sm font-bold outline-none focus:border-indigo-400 text-center transition-colors"
            />
            <button
              type="submit"
              disabled={!newPrize.trim() || prizes.length >= 12}
              className="shrink-0 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40"
              title="Agregar premio"
            >
              <Plus size={18} />
            </button>
          </form>

          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-0.5">
            <AnimatePresence initial={false}>
              {prizes.map((prize, i) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
                >
                  <div className="w-4 h-4 rounded-full shrink-0 ring-2 ring-white shadow-sm" style={{ backgroundColor: prize.color }} />
                  <span className="text-[11px] font-black text-slate-400 w-5 shrink-0 text-center">{i + 1}</span>
                  <input
                    type="text"
                    value={prize.label}
                    onChange={e => updatePrize(prize.id, { label: e.target.value })}
                    maxLength={30}
                    className="flex-1 min-w-0 bg-transparent font-bold text-sm text-slate-800 outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    value={prize.weight ?? 1}
                    onChange={e => updatePrize(prize.id, { weight: Math.max(1, Math.min(1000, Number(e.target.value))) })}
                    title="Peso (probabilidad relativa)"
                    className="w-14 shrink-0 bg-white border border-slate-200 rounded-lg px-1.5 py-1 text-xs font-bold text-center outline-none focus:border-indigo-400"
                  />
                  <button
                    onClick={() => removePrize(prize.id)}
                    disabled={prizes.length <= 2}
                    className="shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-20"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {prizes.length >= 12 && (
            <p className="text-xs font-bold text-amber-500 text-center">Máximo 12 premios alcanzado</p>
          )}
        </div>
      </div>

      {/* Spin history */}
      <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8">
        <h4 className="text-base sm:text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
          <History size={18} className="text-indigo-600" /> Historial de Giros
        </h4>
        {historyLoading ? (
          <div className="flex justify-center items-center py-8 text-slate-400">
            <RotateCw size={18} className="animate-spin mr-2" />
            <span className="font-bold text-sm">Cargando...</span>
          </div>
        ) : history.length === 0 ? (
          <p className="text-center py-8 text-sm font-bold text-slate-400">Aún no hay giros registrados.</p>
        ) : (
          <div className="space-y-2">
            {history.map(h => (
              <div key={h.id} className="flex items-center justify-between gap-3 bg-slate-50 rounded-xl px-4 py-2.5 border border-slate-100">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-800 truncate">{h.user_name}</p>
                  <p className="text-xs font-medium text-slate-400">{formatDateTime(h.spun_at)}</p>
                </div>
                <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full shrink-0">{h.prize_label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Winner modal (preview) */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setWinner(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <button onClick={() => setWinner(null)} className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                <X size={18} />
              </button>
              <motion.div
                initial={{ scale: 0.5, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: winner.color }}
              >
                <Gift size={42} className="text-white" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Vista previa</p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 break-words">{winner.label}</h2>
              </motion.div>
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
                onClick={() => setWinner(null)}
                className="mt-7 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors text-sm shadow-lg shadow-indigo-100"
              >
                Cerrar
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
