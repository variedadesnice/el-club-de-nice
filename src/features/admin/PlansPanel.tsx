import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Tag, Plus, RefreshCw, Trash2, X, Power, Pencil, Infinity as InfinityIcon } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import { Plan } from "../../types";

/** duration_days = null significa "indefinido": la suscripción no vence. */
function formatDuration(days: number | null) {
  if (days === null) return "Indefinido";
  if (days % 365 === 0) return `${days / 365} año${days === 365 ? "" : "s"}`;
  if (days % 30 === 0) return `${days / 30} mes${days === 30 ? "" : "es"}`;
  return `${days} días`;
}

function formatPrice(usd: number) {
  return `$${Number(usd).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

interface PlanFormState {
  code: string;
  name: string;
  sublabel: string;
  priceUsd: string;
  durationDays: string;
  indefinite: boolean;
  sortOrder: string;
}

const EMPTY_FORM: PlanFormState = {
  code: "",
  name: "",
  sublabel: "",
  priceUsd: "",
  durationDays: "",
  indefinite: false,
  sortOrder: "0",
};

function planToForm(plan: Plan): PlanFormState {
  return {
    code: plan.code,
    name: plan.name,
    sublabel: plan.sublabel ?? "",
    priceUsd: String(plan.price_usd),
    durationDays: plan.duration_days === null ? "" : String(plan.duration_days),
    indefinite: plan.duration_days === null,
    sortOrder: String(plan.sort_order),
  };
}

function PlanCard({
  plan,
  onEdit,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggle: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  togglingId: string | null;
  deletingId: string | null;
}) {
  const isToggling = togglingId === plan.id;
  const isDeleting = deletingId === plan.id;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border ${
        plan.is_active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-slate-900 text-sm truncate">{plan.name}</p>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200 text-slate-500 shrink-0">
            {plan.code}
          </span>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
              plan.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
            }`}
          >
            {plan.is_active ? "Activo" : "Inactivo"}
          </span>
        </div>
        {plan.sublabel && (
          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{plan.sublabel}</p>
        )}
        <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600">{formatPrice(plan.price_usd)}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            {plan.duration_days === null && <InfinityIcon size={11} />}
            {formatDuration(plan.duration_days)}
          </span>
          <span>·</span>
          <span>Orden {plan.sort_order}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onEdit(plan)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          title="Editar plan"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onToggle(plan)}
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50 ${
            plan.is_active
              ? "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isToggling ? <RefreshCw size={13} className="animate-spin" /> : <Power size={13} />}
          {plan.is_active ? "Desactivar" : "Activar"}
        </button>
        <button
          onClick={() => onDelete(plan)}
          disabled={isDeleting}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50"
          title="Eliminar plan"
        >
          {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function PlansPanel() {
  const api = useApiFetch();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // null = modal cerrado · Plan = editando ese plan · "new" = creando uno nuevo
  const [editing, setEditing] = useState<Plan | "new" | null>(null);
  const [form, setForm] = useState<PlanFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api<Plan[]>("/api/admin/plans/");
      setPlans(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar los planes");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    // sort_order por defecto: al final de la lista actual.
    const nextOrder = plans.reduce((max, p) => Math.max(max, p.sort_order), -1) + 1;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setSaveError(null);
    setEditing("new");
  }

  function openEdit(plan: Plan) {
    setForm(planToForm(plan));
    setSaveError(null);
    setEditing(plan);
  }

  function closeModal() {
    if (saving) return;
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const price = Number(form.priceUsd);
    const duration = form.indefinite ? null : Number(form.durationDays);
    const sortOrder = Number(form.sortOrder);

    if (!Number.isFinite(price) || price < 0) {
      setSaveError("El precio debe ser un número mayor o igual a 0.");
      return;
    }
    if (duration !== null && (!Number.isInteger(duration) || duration <= 0)) {
      setSaveError("La duración debe ser un número entero de días mayor a 0.");
      return;
    }
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setSaveError("El orden debe ser un número entero mayor o igual a 0.");
      return;
    }

    const payload = {
      code: form.code.trim().toLowerCase(),
      name: form.name.trim(),
      sublabel: form.sublabel.trim() || null,
      duration_days: duration,
      price_usd: price,
      sort_order: sortOrder,
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (editing === "new") {
        const { data } = await api<Plan>("/api/admin/plans/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, is_active: true }),
        });
        setPlans(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order));
      } else {
        const { data } = await api<Plan>(`/api/admin/plans/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setPlans(prev =>
          prev.map(p => (p.id === data.id ? data : p)).sort((a, b) => a.sort_order - b.sort_order)
        );
      }
      setEditing(null);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar el plan");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(plan: Plan) {
    setTogglingId(plan.id);
    setError(null);
    try {
      const { data } = await api<Plan>(`/api/admin/plans/${plan.id}/toggle`, { method: "PATCH" });
      setPlans(prev => prev.map(p => (p.id === data.id ? data : p)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cambiar el estado del plan");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(plan: Plan) {
    if (!confirm(`¿Eliminar el plan "${plan.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(plan.id);
    setError(null);
    try {
      await api(`/api/admin/plans/${plan.id}`, { method: "DELETE" });
      setPlans(prev => prev.filter(p => p.id !== plan.id));
    } catch (e: unknown) {
      // El backend responde 409 cuando el plan ya tiene pagos asociados —
      // en ese caso lo correcto es desactivarlo, no borrarlo.
      setError(e instanceof Error ? e.message : "Error al eliminar el plan");
    } finally {
      setDeletingId(null);
    }
  }

  const isCreating = editing === "new";

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
              <Tag className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /> Planes de Suscripción
            </h3>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Los planes activos son los que ven los usuarios al registrarse y al renovar.
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={load}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border-2 border-slate-200 text-xs sm:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Actualizar
            </button>
            <button
              onClick={openCreate}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus size={15} /> Nuevo plan
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-4 py-3 mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12 text-slate-400">
            <RefreshCw size={22} className="animate-spin mr-3" />
            <span className="font-bold">Cargando planes...</span>
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Tag size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Aún no hay planes creados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {plans.map(p => (
              <PlanCard
                key={p.id}
                plan={p}
                onEdit={openEdit}
                onToggle={handleToggle}
                onDelete={handleDelete}
                togglingId={togglingId}
                deletingId={deletingId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal crear / editar */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {isCreating ? "Nuevo Plan" : "Editar Plan"}
                </h2>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      Código
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={30}
                      value={form.code}
                      onChange={e => setForm({ ...form, code: e.target.value })}
                      placeholder="1m"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors lowercase"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      Orden
                    </label>
                    <input
                      type="number"
                      required
                      min={0}
                      step={1}
                      value={form.sortOrder}
                      onChange={e => setForm({ ...form, sortOrder: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>
                {!isCreating && (
                  <p className="text-[11px] font-medium text-amber-600 -mt-3">
                    El código es lo que queda guardado en cada pago. Si lo cambias, los pagos
                    anteriores seguirán apuntando al código viejo.
                  </p>
                )}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Nombre
                  </label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder="Ej. Plan Mensual"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Subtítulo (opcional)
                  </label>
                  <input
                    type="text"
                    value={form.sublabel}
                    onChange={e => setForm({ ...form, sublabel: e.target.value })}
                    placeholder="Ej. Facturado cada mes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Precio (USD)
                  </label>
                  <input
                    type="number"
                    required
                    min={0}
                    step="0.01"
                    value={form.priceUsd}
                    onChange={e => setForm({ ...form, priceUsd: e.target.value })}
                    placeholder="25.00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                  <p className="text-[11px] font-medium text-slate-400 mt-1.5">
                    El monto en Bs. se calcula solo con la tasa BCV del día.
                  </p>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Duración (días)
                  </label>
                  <input
                    type="number"
                    required={!form.indefinite}
                    disabled={form.indefinite}
                    min={1}
                    step={1}
                    value={form.indefinite ? "" : form.durationDays}
                    onChange={e => setForm({ ...form, durationDays: e.target.value })}
                    placeholder="30"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors disabled:opacity-50"
                  />
                  <label className="flex items-center gap-2 mt-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.indefinite}
                      onChange={e => setForm({ ...form, indefinite: e.target.checked })}
                      className="w-4 h-4 rounded accent-indigo-600"
                    />
                    <span className="text-xs font-bold text-slate-600">
                      Indefinido (la suscripción nunca vence)
                    </span>
                  </label>
                </div>

                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !form.code.trim() || !form.name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {saving ? (
                      <><RefreshCw size={16} className="animate-spin" /> Guardando...</>
                    ) : (
                      <><Tag size={16} /> {isCreating ? "Crear plan" : "Guardar cambios"}</>
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
