import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Shuffle, Trash2, RefreshCw, Trophy, Plus, X, ChevronDown, ChevronUp, Star } from "lucide-react";
import { useApiFetch } from "../../lib/api";

interface RaffleWinner {
  id: string;
  user_id: string;
  position: number;
  name: string;
  avatar?: string | null;
}

interface Raffle {
  id: string;
  title: string;
  winner_count: number;
  created_at: string;
  winners: RaffleWinner[];
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function Avatar({ name, avatar, size = "md" }: { name: string; avatar?: string | null; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "w-16 h-16 text-xl" : size === "md" ? "w-10 h-10 text-sm" : "w-7 h-7 text-xs";
  if (avatar) return <img src={avatar} alt={name} className={`${dims} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${dims} rounded-full bg-indigo-100 text-indigo-600 font-black flex items-center justify-center flex-shrink-0`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

const POSITION_COLORS = ["#f59e0b", "#94a3b8", "#cd7c3a"];
const POSITION_LABELS = ["1.er lugar", "2.do lugar", "3.er lugar"];

function WinnerCard({ winner, delay }: { winner: RaffleWinner; delay: number }) {
  const color = POSITION_COLORS[winner.position - 1] ?? "#6366f1";
  const label = POSITION_LABELS[winner.position - 1] ?? `${winner.position}.° lugar`;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 300, damping: 24 }}
      className="flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-slate-100 shadow-sm"
    >
      <div className="relative">
        <Avatar name={winner.name} avatar={winner.avatar} size="lg" />
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
          <Star size={12} className="text-white fill-white" />
        </div>
      </div>
      <div className="text-center">
        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>{label}</p>
        <p className="font-black text-slate-900 text-sm mt-0.5">{winner.name}</p>
      </div>
    </motion.div>
  );
}

function RaffleHistoryCard({ raffle, onDelete }: { raffle: Raffle; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm(`¿Eliminar el sorteo "${raffle.title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    onDelete(raffle.id);
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
          <Trophy size={16} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-black text-slate-900 text-sm truncate">{raffle.title}</p>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            {formatDate(raffle.created_at)} · {raffle.winner_count} ganador{raffle.winner_count !== 1 ? "es" : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => setExpanded(v => !v)}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
          >
            {deleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-1 border-t border-slate-200 space-y-2">
              {raffle.winners.map(w => (
                <div key={w.id} className="flex items-center gap-3 bg-white rounded-xl px-3 py-2.5 border border-slate-100">
                  <span
                    className="text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center text-white flex-shrink-0"
                    style={{ backgroundColor: POSITION_COLORS[w.position - 1] ?? "#6366f1" }}
                  >
                    {w.position}
                  </span>
                  <Avatar name={w.name} avatar={w.avatar} size="sm" />
                  <span className="font-bold text-sm text-slate-800 truncate">{w.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function RafflesPanel() {
  const api = useApiFetch();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [winnerCount, setWinnerCount] = useState(1);
  const [running, setRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const [lastResult, setLastResult] = useState<Raffle | null>(null);

  const loadRaffles = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api<Raffle[]>("/api/admin/raffles/");
      setRaffles(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar sorteos");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { loadRaffles(); }, [loadRaffles]);

  function openModal() {
    setTitle("");
    setWinnerCount(1);
    setRunError(null);
    setIsModalOpen(true);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setRunning(true);
    setRunError(null);
    try {
      const { data } = await api<Raffle>("/api/admin/raffles/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), winner_count: winnerCount }),
      });
      setRaffles(prev => [data, ...prev]);
      setLastResult(data);
      setIsModalOpen(false);
    } catch (e: unknown) {
      setRunError(e instanceof Error ? e.message : "Error al realizar el sorteo");
    } finally {
      setRunning(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api(`/api/admin/raffles/${id}`, { method: "DELETE" });
      setRaffles(prev => prev.filter(r => r.id !== id));
      if (lastResult?.id === id) setLastResult(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar el sorteo");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
              <Shuffle className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /> Sorteos
            </h3>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Selecciona ganadores aleatorios entre los miembros activos.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={loadRaffles}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs sm:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
            <button
              onClick={openModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus size={15} /> Nuevo sorteo
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {/* Last result spotlight */}
        <AnimatePresence>
          {lastResult && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs font-black text-indigo-400 uppercase tracking-widest">Último sorteo</p>
                  <p className="font-black text-slate-900 text-base sm:text-lg mt-0.5">{lastResult.title}</p>
                </div>
                <button onClick={() => setLastResult(null)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={16} />
                </button>
              </div>
              <div className={`grid gap-3 ${lastResult.winners.length === 1 ? "grid-cols-1 max-w-xs mx-auto" : lastResult.winners.length === 2 ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"}`}>
                {lastResult.winners.map((w, i) => (
                  <WinnerCard key={w.id} winner={w} delay={i * 0.12} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* History */}
      <div className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-sm">
        <h4 className="text-base sm:text-lg font-black text-slate-900 mb-5 flex items-center gap-2">
          <Trophy size={18} className="text-indigo-600" /> Historial de Sorteos
        </h4>

        {loading ? (
          <div className="flex justify-center items-center py-12 text-slate-400">
            <RefreshCw size={22} className="animate-spin mr-3" />
            <span className="font-bold">Cargando sorteos...</span>
          </div>
        ) : raffles.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Shuffle size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Aún no hay sorteos realizados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {raffles.map(r => (
              <RaffleHistoryCard key={r.id} raffle={r} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !running && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Nuevo Sorteo</h2>
                <button onClick={() => !running && setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Nombre del sorteo
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. Sorteo de Navidad"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-3">
                    Número de ganadores
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setWinnerCount(n)}
                        className={`w-11 h-11 rounded-xl font-black text-sm transition-all ${winnerCount === n ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
                      >
                        {n}
                      </button>
                    ))}
                    <div className="flex items-center gap-2 ml-1">
                      <span className="text-xs font-bold text-slate-400">o</span>
                      <input
                        type="number"
                        min={1}
                        max={20}
                        value={winnerCount}
                        onChange={e => setWinnerCount(Math.max(1, Math.min(20, Number(e.target.value))))}
                        className="w-16 h-11 bg-slate-50 border border-slate-200 rounded-xl px-3 text-sm font-bold outline-none focus:border-indigo-400 text-center transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {runError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3">
                    {runError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !running && setIsModalOpen(false)}
                    disabled={running}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={running || !title.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {running ? (
                      <><RefreshCw size={16} className="animate-spin" /> Sorteando...</>
                    ) : (
                      <><Shuffle size={16} /> ¡Sortear!</>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
