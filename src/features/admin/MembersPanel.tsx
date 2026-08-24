import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users, Search, RefreshCw, AlertTriangle, CalendarClock,
  CheckCircle, XCircle, ShieldCheck, MapPin, Mail, Phone,
} from "lucide-react";
import { useApiFetch } from "../../lib/api";
import type { AdminMember, AdminMembersResponse, MemberAccessState } from "../../types";

type FilterKey = "all" | MemberAccessState;

const STATE_META: Record<MemberAccessState, {
  label: string; badge: string; dot: string; icon: React.ReactNode;
}> = {
  expired: {
    label: "Vencido",
    badge: "bg-red-100 text-red-700 border-red-200",
    dot: "bg-red-500",
    icon: <XCircle size={14} />,
  },
  expiring_soon: {
    label: "Por vencer",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
    icon: <CalendarClock size={14} />,
  },
  active: {
    label: "Activo",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dot: "bg-emerald-500",
    icon: <CheckCircle size={14} />,
  },
  inactive: {
    label: "Inactivo",
    badge: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
    icon: <AlertTriangle size={14} />,
  },
  exempt: {
    label: "Exento",
    badge: "bg-indigo-100 text-indigo-700 border-indigo-200",
    dot: "bg-indigo-500",
    icon: <ShieldCheck size={14} />,
  },
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "expired", label: "Vencidos" },
  { key: "expiring_soon", label: "Por vencer" },
  { key: "active", label: "Activos" },
  { key: "inactive", label: "Inactivos" },
  { key: "exempt", label: "Exentos" },
];

function formatDate(iso: string | null) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("es", { day: "2-digit", month: "short", year: "numeric" });
}

/** Texto humano del vencimiento: "vence en 5 días", "venció hace 12 días". */
function expiryText(member: AdminMember) {
  const { days_remaining: days, access_state: state } = member;
  if (state === "exempt") return "Sin vencimiento";
  if (days === null) return "Sin pago registrado";
  if (days < 0) {
    const n = Math.abs(days);
    return `Venció hace ${n} ${n === 1 ? "día" : "días"}`;
  }
  if (days === 0) return "Vence hoy";
  return `Vence en ${days} ${days === 1 ? "día" : "días"}`;
}

function initials(name: string | null) {
  if (!name) return "?";
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function SummaryCard({
  label, value, accent, icon, active, onClick,
}: {
  label: string; value: number; accent: string; icon: React.ReactNode;
  active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left bg-white rounded-2xl border p-4 transition-all hover:shadow-md ${
        active ? "border-indigo-400 ring-2 ring-indigo-100" : "border-slate-100"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <span className={`w-8 h-8 rounded-xl flex items-center justify-center ${accent}`}>{icon}</span>
        <span className="text-2xl font-black text-slate-900">{value}</span>
      </div>
      <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider">{label}</p>
    </button>
  );
}

export default function MembersPanel() {
  const api = useApiFetch();
  const [data, setData] = useState<AdminMembersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [query, setQuery] = useState("");

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data: res } = await api<AdminMembersResponse>("/api/admin/members/");
      setData(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar los miembros");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  async function handleRefresh() {
    setRefreshing(true);
    await load();
  }

  const visible = useMemo(() => {
    const members = data?.members ?? [];
    const q = query.trim().toLowerCase();
    return members.filter((m) => {
      if (filter !== "all" && m.access_state !== filter) return false;
      if (!q) return true;
      return [m.name, m.email, m.city, m.phone]
        .some((field) => (field ?? "").toLowerCase().includes(q));
    });
  }, [data, filter, query]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 font-bold text-sm">
        <RefreshCw className="animate-spin mr-2" size={18} /> Cargando miembros...
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 text-center">
        <XCircle className="mx-auto text-red-500 mb-2" size={28} />
        <p className="font-bold text-red-700">{error}</p>
        <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-xl font-bold text-sm">
          Reintentar
        </button>
      </div>
    );
  }

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Users size={22} className="text-indigo-600" /> Miembros
          </h2>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Roster completo con el estado real de cada suscripción.
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-sm text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} /> Actualizar
        </button>
      </div>

      {/* Tarjetas-resumen: además de informar, filtran al hacer click */}
      {summary && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <SummaryCard
            label="Vencidos" value={summary.expired ?? 0} accent="bg-red-100 text-red-600"
            icon={<XCircle size={16} />}
            active={filter === "expired"}
            onClick={() => setFilter(filter === "expired" ? "all" : "expired")}
          />
          <SummaryCard
            label="Por vencer" value={summary.expiring_soon ?? 0} accent="bg-amber-100 text-amber-600"
            icon={<CalendarClock size={16} />}
            active={filter === "expiring_soon"}
            onClick={() => setFilter(filter === "expiring_soon" ? "all" : "expiring_soon")}
          />
          <SummaryCard
            label="Activos" value={summary.active ?? 0} accent="bg-emerald-100 text-emerald-600"
            icon={<CheckCircle size={16} />}
            active={filter === "active"}
            onClick={() => setFilter(filter === "active" ? "all" : "active")}
          />
          <SummaryCard
            label="Inactivos" value={summary.inactive ?? 0} accent="bg-slate-100 text-slate-500"
            icon={<AlertTriangle size={16} />}
            active={filter === "inactive"}
            onClick={() => setFilter(filter === "inactive" ? "all" : "inactive")}
          />
          <SummaryCard
            label="Total" value={summary.total ?? 0} accent="bg-indigo-100 text-indigo-600"
            icon={<Users size={16} />}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, email, ciudad o teléfono..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none focus:border-indigo-400 transition-colors"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                filter === f.key
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <p className="text-xs font-bold text-slate-400">
        Mostrando {visible.length} de {data?.members.length ?? 0} miembros
      </p>

      {visible.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
          <Users className="mx-auto text-slate-300 mb-3" size={32} />
          <p className="font-bold text-slate-500 text-sm">Ningún miembro coincide con el filtro.</p>
        </div>
      ) : (
        <>
          {/* Escritorio: tabla */}
          <div className="hidden lg:block bg-white rounded-2xl border border-slate-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr className="text-left">
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Miembro</th>
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Estado</th>
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Vencimiento</th>
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Plan</th>
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Ciudad</th>
                    <th className="px-4 py-3 font-black text-[11px] text-slate-500 uppercase tracking-wider">Rol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {visible.map((m) => {
                    const meta = STATE_META[m.access_state];
                    return (
                      <tr key={m.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {m.avatar ? (
                              <img src={m.avatar} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
                            ) : (
                              <span className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 font-black text-xs flex items-center justify-center shrink-0">
                                {initials(m.name)}
                              </span>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate">{m.name || "Sin nombre"}</p>
                              <p className="text-xs text-slate-500 truncate">{m.email || "Sin email"}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-bold text-xs ${meta.badge}`}>
                            {meta.icon} {meta.label}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-700">{formatDate(m.subscription_expires_at)}</p>
                          <p className={`text-xs font-medium ${
                            m.access_state === "expired" ? "text-red-600"
                              : m.access_state === "expiring_soon" ? "text-amber-600"
                              : "text-slate-400"
                          }`}>
                            {expiryText(m)}
                          </p>
                        </td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{m.plan || "—"}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{m.city || "—"}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs font-bold text-slate-500 capitalize">{m.role || "—"}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Móvil: tarjetas */}
          <div className="lg:hidden space-y-3">
            {visible.map((m) => {
              const meta = STATE_META[m.access_state];
              return (
                <div key={m.id} className="bg-white rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start gap-3">
                    {m.avatar ? (
                      <img src={m.avatar} alt="" className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <span className="w-11 h-11 rounded-full bg-slate-100 text-slate-500 font-black text-sm flex items-center justify-center shrink-0">
                        {initials(m.name)}
                      </span>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-black text-slate-900 truncate">{m.name || "Sin nombre"}</p>
                        <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-lg border font-bold text-[10px] ${meta.badge}`}>
                          {meta.icon} {meta.label}
                        </span>
                      </div>
                      <p className={`text-xs font-bold mt-1 ${
                        m.access_state === "expired" ? "text-red-600"
                          : m.access_state === "expiring_soon" ? "text-amber-600"
                          : "text-slate-500"
                      }`}>
                        {expiryText(m)} · {formatDate(m.subscription_expires_at)}
                      </p>
                      <div className="mt-2 space-y-1 text-xs text-slate-500 font-medium">
                        {m.email && (
                          <p className="flex items-center gap-1.5 truncate"><Mail size={12} /> {m.email}</p>
                        )}
                        {m.phone && (
                          <p className="flex items-center gap-1.5"><Phone size={12} /> {m.phone}</p>
                        )}
                        {m.city && (
                          <p className="flex items-center gap-1.5"><MapPin size={12} /> {m.city}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
