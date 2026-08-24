import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Plus, Radio, AlertCircle, Clock, Trash2, Play, CalendarClock } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { useApiFetch } from "../../../lib/api";
import { isAdmin } from "../../../lib/permissions";
import LivePlayer from "./LivePlayer";
import LiveChat from "./LiveChat";
import LiveReactions from "./LiveReactions";
import LivePdfs from "./LivePdfs";
import Spinner from "../../../shared/ui/Spinner";

interface LiveSession {
  id: string;
  title: string;
  description?: string;
  youtubeUrl?: string;
  isActive: boolean;
  scheduledAt?: string;
  createdAt: string;
}

function useCountdown(targetDate?: string | null) {
  const [text, setText] = useState("");

  useEffect(() => {
    if (!targetDate) { setText(""); return; }

    const tick = () => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) { setText("¡Ya es la hora!"); return; }
      const d = Math.floor(diff / 86400000);
      const h = Math.floor((diff % 86400000) / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      if (d > 0) setText(`${d}d ${h}h ${m}m`);
      else if (h > 0) setText(`${h}h ${m}m ${s}s`);
      else setText(`${m}m ${s}s`);
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return text;
}

function formatScheduled(iso?: string) {
  if (!iso) return "Sin fecha programada";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Fecha inválida";
  return date.toLocaleString("es", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

/**
 * Panel de admin con todas las transmisiones que no están al aire: programadas a
 * futuro, vencidas y las que quedaron sin fecha. Es el único punto de la app
 * desde el que se puede activar o eliminar un live ya creado.
 */
function ScheduledLivesPanel({
  lives, busyId, onActivate, onDelete,
}: {
  lives: LiveSession[];
  busyId: string | null;
  onActivate: (live: LiveSession) => void;
  onDelete: (live: LiveSession) => void;
}) {
  if (lives.length === 0) return null;

  return (
    <div className="w-full bg-white border border-slate-100 rounded-3xl shadow-sm p-5 text-left">
      <h3 className="flex items-center gap-2 font-bold text-slate-900 mb-4">
        <CalendarClock size={18} className="text-violet-500" />
        Transmisiones programadas
        <span className="ml-auto text-xs font-bold text-slate-400">{lives.length}</span>
      </h3>

      <ul className="space-y-2">
        {lives.map((live) => {
          const isPast = !!live.scheduledAt && new Date(live.scheduledAt) < new Date();
          const isBusy = busyId === live.id;

          return (
            <li
              key={live.id}
              className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-100"
            >
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-slate-900 truncate">{live.title}</p>
                <p className={`text-xs font-medium mt-0.5 ${isPast ? "text-amber-600" : "text-slate-500"}`}>
                  {formatScheduled(live.scheduledAt)}
                  {isPast && " · vencida"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onActivate(live)}
                disabled={isBusy}
                title="Poner en vivo ahora"
                className="shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-xs hover:bg-red-200 transition-colors disabled:opacity-50"
              >
                <Play size={14} /> Activar
              </button>

              <button
                type="button"
                onClick={() => onDelete(live)}
                disabled={isBusy}
                title="Eliminar transmisión"
                aria-label={`Eliminar ${live.title}`}
                className="shrink-0 p-2 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <Trash2 size={16} />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function LiveView() {
  const { user } = useAuth();
  const api = useApiFetch();
  const userIsAdmin = isAdmin(user?.role);

  const [lives, setLives] = useState<LiveSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Admin form
  const [showForm, setShowForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newScheduledAt, setNewScheduledAt] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const liveSession = useMemo(() => lives.find((l) => l.isActive) ?? null, [lives]);

  // Programadas = todo lo que no está al aire. Las de fecha futura primero (la
  // más próxima arriba), después las vencidas y las que no tienen fecha.
  const scheduledLives = useMemo(() => {
    const now = Date.now();
    return lives
      .filter((l) => !l.isActive)
      .sort((a, b) => {
        const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
        const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
        const aFuture = ta >= now;
        const bFuture = tb >= now;
        if (aFuture !== bFuture) return aFuture ? -1 : 1;
        return aFuture ? ta - tb : tb - ta;
      });
  }, [lives]);

  const nextScheduled = useMemo(() => {
    if (liveSession) return null;
    return scheduledLives.find(
      (l) => l.scheduledAt && new Date(l.scheduledAt).getTime() >= Date.now()
    ) ?? null;
  }, [liveSession, scheduledLives]);

  const countdown = useCountdown(nextScheduled?.scheduledAt);

  const fetchCurrentLive = useCallback(async () => {
    try {
      const { data: all } = await api<LiveSession[]>("/api/lives/");
      setLives(all);
    } catch (err) {
      console.error("[LiveView] Error fetching live:", err);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchCurrentLive();
    // 10s cuando hay live activo, 30s cuando no hay (reduce carga en Supabase)
    const interval = setInterval(fetchCurrentLive, liveSession ? 10_000 : 30_000);
    return () => clearInterval(interval);
  }, [fetchCurrentLive, liveSession?.id]);

  const handleCreateLive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) { setError("El título es obligatorio"); return; }
    setIsSubmitting(true);
    setError(null);
    try {
      // datetime-local devuelve una fecha local sin zona; se manda en ISO con
      // offset para que el backend no la interprete en otra zona horaria.
      const scheduledDate = newScheduledAt ? new Date(newScheduledAt) : null;
      const scheduleForLater = !!scheduledDate && scheduledDate.getTime() > Date.now();

      const { data: created } = await api<LiveSession>("/api/admin/lives/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle.trim(),
          youtubeUrl: newUrl.trim() || undefined,
          description: newDescription.trim() || undefined,
          scheduledAt: scheduledDate ? scheduledDate.toISOString() : undefined,
        }),
      });

      // Solo se pone al aire si no quedó programada para más tarde.
      if (!scheduleForLater) {
        await api<LiveSession>(`/api/admin/lives/${created.id}/activate`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: true }),
        });
      }

      await fetchCurrentLive();
      setShowForm(false);
      setNewTitle(""); setNewUrl(""); setNewDescription(""); setNewScheduledAt("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear transmisión");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEndLive = async () => {
    if (!liveSession || !window.confirm("¿Seguro que quieres terminar esta transmisión?")) return;
    try {
      await api(`/api/admin/lives/${liveSession.id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      });
      await fetchCurrentLive();
    } catch (err) {
      console.error("[LiveView] Error ending live:", err);
      alert(err instanceof Error ? err.message : "Error al terminar la transmisión");
    }
  };

  const handleActivateLive = async (live: LiveSession) => {
    if (!window.confirm(`¿Poner "${live.title}" en vivo ahora?`)) return;
    setBusyId(live.id);
    try {
      await api(`/api/admin/lives/${live.id}/activate`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: true }),
      });
      await fetchCurrentLive();
    } catch (err) {
      console.error("[LiveView] Error activating live:", err);
      alert(err instanceof Error ? err.message : "Error al activar la transmisión");
    } finally {
      setBusyId(null);
    }
  };

  const handleDeleteLive = async (live: LiveSession) => {
    if (!window.confirm(
      `¿Eliminar "${live.title}"? Se borrarán también su chat, reacciones y PDFs. Esta acción no se puede deshacer.`
    )) return;
    setBusyId(live.id);
    try {
      await api(`/api/admin/lives/${live.id}`, { method: "DELETE" });
      await fetchCurrentLive();
    } catch (err) {
      console.error("[LiveView] Error deleting live:", err);
      alert(err instanceof Error ? err.message : "Error al eliminar la transmisión");
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <Spinner />;

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 transition-colors";

  const adminPanel = userIsAdmin ? (
    <ScheduledLivesPanel
      lives={scheduledLives}
      busyId={busyId}
      onActivate={handleActivateLive}
      onDelete={handleDeleteLive}
    />
  ) : null;

  return (
    <div className="max-w-7xl mx-auto flex flex-col lg:h-[calc(100vh-8rem)]">
      <header className="flex items-start justify-between gap-4 mb-4 lg:mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Radio className="text-red-500" size={24} />
            En Vivo
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">Conéctate e interactúa en tiempo real</p>
        </div>
        {userIsAdmin && liveSession && (
          <button
            onClick={handleEndLive}
            className="px-3 py-2 bg-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-200 transition-colors shrink-0"
          >
            <span className="hidden sm:inline">Terminar </span>transmisión
          </button>
        )}
      </header>

      {liveSession ? (
        <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6 lg:min-h-0 lg:overflow-hidden">
          {/* Columna izquierda: video + descripción + reacciones + PDFs */}
          <div className="flex-1 min-w-0 flex flex-col gap-4 lg:overflow-y-auto 3xl:flex-none 3xl:w-[760px]">
            <LivePlayer youtubeUrl={liveSession.youtubeUrl ?? ""} />

            <div className="flex items-start justify-between gap-4 px-4 sm:px-6">
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="text-xl font-black text-slate-900">{liveSession.title}</h2>
                  <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black uppercase tracking-wider rounded">
                    En vivo ahora
                  </span>
                </div>
                {liveSession.description && (
                  <p className="text-sm text-slate-500 mt-1 leading-relaxed">{liveSession.description}</p>
                )}
              </div>
              <div className="shrink-0 mt-1">
                <LiveReactions liveId={liveSession.id} />
              </div>
            </div>

            <LivePdfs liveId={liveSession.id} isAdmin={userIsAdmin} />

            {adminPanel}
          </div>

          {/* Columna derecha: chat */}
          <div className="w-full lg:w-[380px] xl:w-[420px] 3xl:flex-1 lg:shrink-0 3xl:shrink lg:min-h-0">
            <LiveChat liveId={liveSession.id} />
          </div>
        </div>
      ) : (
        <div className="min-h-[60vh] lg:flex-1 lg:min-h-0 lg:overflow-y-auto flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-3xl p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
            <Radio className="text-slate-400" size={32} />
          </div>
          <h2 className="text-xl font-black text-slate-900">No hay ninguna transmisión activa</h2>

          {/* Countdown para el próximo live programado */}
          {nextScheduled && (
            <div className="mt-4 bg-violet-50 border border-violet-100 rounded-2xl px-6 py-4 max-w-sm">
              <p className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1">Próximo live</p>
              <p className="font-black text-slate-900">{nextScheduled.title}</p>
              <div className="flex items-center gap-1.5 mt-2 text-violet-600">
                <Clock size={14} />
                <span className="text-sm font-bold">{countdown || "Calculando..."}</span>
              </div>
            </div>
          )}

          {!nextScheduled && (
            <p className="text-slate-500 mt-2 max-w-md text-sm">
              Mantente atento a nuestros anuncios para saber cuándo será la próxima sesión en vivo.
            </p>
          )}

          {userIsAdmin && (
            <div className="mt-8 w-full max-w-md space-y-4">
              {!showForm ? (
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-brand-primary text-white rounded-2xl font-bold shadow-md hover:bg-brand-primary-hover transition-colors"
                >
                  <Plus size={20} /> Empezar nueva transmisión
                </button>
              ) : (
                <form onSubmit={handleCreateLive} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm text-left space-y-4">
                  <h3 className="font-bold text-slate-900">Configurar transmisión</h3>

                  {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-xl">
                      <AlertCircle size={16} /> {error}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Título *</label>
                    <input type="text" value={newTitle} onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Ej. Q&A Semanal — El Club de Nice" className={inputClass} required />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">URL de YouTube <span className="font-normal text-slate-400">(opcional)</span></label>
                    <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=..." className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Descripción <span className="font-normal text-slate-400">(opcional)</span></label>
                    <textarea value={newDescription} onChange={(e) => setNewDescription(e.target.value)}
                      placeholder="De qué trata esta sesión..." rows={2}
                      className={`${inputClass} resize-none`} />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Hora programada <span className="font-normal text-slate-400">(opcional)</span></label>
                    <input type="datetime-local" value={newScheduledAt} onChange={(e) => setNewScheduledAt(e.target.value)}
                      className={inputClass} />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Con una fecha futura la transmisión queda programada. Sin fecha, empieza en vivo de inmediato.
                    </p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="button" onClick={() => setShowForm(false)}
                      className="flex-1 py-2.5 border border-slate-200 rounded-xl text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={isSubmitting}
                      className="flex-1 py-2.5 bg-red-500 text-white rounded-xl font-bold text-sm shadow-md hover:bg-red-600 transition-colors disabled:opacity-50">
                      {isSubmitting ? "Guardando..." : "Guardar transmisión"}
                    </button>
                  </div>
                </form>
              )}

              {adminPanel}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
