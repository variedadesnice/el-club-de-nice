import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Plus, Edit2, Trash2, X, RefreshCw, CreditCard, Save,
  ChevronDown, ChevronUp, Power, GripVertical,
} from "lucide-react";
import { useApiFetch } from "../../lib/api";
import type { AdminPaymentMethod, AdminPaymentMethodField, PaymentMethodFieldType } from "../../types";

const FIELD_TYPE_LABELS: Record<PaymentMethodFieldType, string> = {
  text: "Texto",
  email: "Email",
  phone: "Teléfono",
  number: "Número",
};

const FIELD_TYPES: PaymentMethodFieldType[] = ["text", "email", "phone", "number"];

interface FieldDraft {
  field_key: string;
  field_label: string;
  field_type: PaymentMethodFieldType;
  is_required: boolean;
}

const EMPTY_FIELD_DRAFT: FieldDraft = { field_key: "", field_label: "", field_type: "text", is_required: true };

interface MethodDraft {
  id?: string;
  name: string;
  description: string;
  is_active: boolean;
  sort_order: number;
  fields: FieldDraft[];
}

const EMPTY_METHOD_DRAFT: MethodDraft = { name: "", description: "", is_active: true, sort_order: 0, fields: [] };

type Api = ReturnType<typeof useApiFetch>;

// ---------------------------------------------------------------------------
// Tarjeta de un método de pago (campos + valores)
// ---------------------------------------------------------------------------

function PaymentMethodCard({
  method, api, onUpdate, onDelete, onEdit,
}: {
  method: AdminPaymentMethod;
  api: Api;
  onUpdate: (m: AdminPaymentMethod) => void;
  onDelete: (id: string) => void;
  onEdit: (m: AdminPaymentMethod) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Valores configurados
  const [values, setValues] = useState<Record<string, string>>({});
  const [savingValues, setSavingValues] = useState(false);

  // Nuevo campo
  const [newField, setNewField] = useState<FieldDraft>(EMPTY_FIELD_DRAFT);
  const [addingField, setAddingField] = useState(false);

  // Edición de campo existente
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [fieldDraft, setFieldDraft] = useState<FieldDraft>(EMPTY_FIELD_DRAFT);
  const [savingFieldId, setSavingFieldId] = useState<string | null>(null);
  const [deletingFieldId, setDeletingFieldId] = useState<string | null>(null);

  useEffect(() => {
    const initial: Record<string, string> = {};
    for (const f of method.fields) {
      initial[f.field_key] = f.value ?? "";
    }
    setValues(initial);
  }, [method.fields]);

  async function handleToggleActive() {
    setToggling(true);
    setError(null);
    try {
      const { data } = await api<AdminPaymentMethod>(`/api/admin/payment-methods/${method.id}/toggle`, { method: "PATCH" });
      onUpdate(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cambiar el estado");
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!confirm(`¿Eliminar el método de pago "${method.name}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    setError(null);
    try {
      await api(`/api/admin/payment-methods/${method.id}`, { method: "DELETE" });
      onDelete(method.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el método de pago");
      setDeleting(false);
    }
  }

  async function handleSaveValues() {
    setSavingValues(true);
    setError(null);
    try {
      const { data } = await api<AdminPaymentMethod>(`/api/admin/payment-methods/${method.id}/values`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          values: method.fields.map((f) => ({ field_key: f.field_key, value: values[f.field_key] || null })),
        }),
      });
      onUpdate(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar los valores");
    } finally {
      setSavingValues(false);
    }
  }

  async function handleAddField(e: React.FormEvent) {
    e.preventDefault();
    if (!newField.field_key.trim() || !newField.field_label.trim()) return;
    setAddingField(true);
    setError(null);
    try {
      await api<AdminPaymentMethodField>(`/api/admin/payment-methods/${method.id}/fields`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_key: newField.field_key.trim(),
          field_label: newField.field_label.trim(),
          field_type: newField.field_type,
          is_required: newField.is_required,
        }),
      });
      const { data } = await api<AdminPaymentMethod[]>("/api/admin/payment-methods/");
      const refreshed = data.find((m) => m.id === method.id);
      if (refreshed) onUpdate(refreshed);
      setNewField(EMPTY_FIELD_DRAFT);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al agregar el campo");
    } finally {
      setAddingField(false);
    }
  }

  function startEditField(f: AdminPaymentMethodField) {
    setEditingFieldId(f.id);
    setFieldDraft({
      field_key: f.field_key,
      field_label: f.field_label,
      field_type: f.field_type,
      is_required: f.is_required,
    });
  }

  async function handleSaveField(fieldId: string) {
    setSavingFieldId(fieldId);
    setError(null);
    try {
      await api<AdminPaymentMethodField>(`/api/admin/payment-methods/${method.id}/fields/${fieldId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field_label: fieldDraft.field_label.trim(),
          field_type: fieldDraft.field_type,
          is_required: fieldDraft.is_required,
        }),
      });
      const { data } = await api<AdminPaymentMethod[]>("/api/admin/payment-methods/");
      const refreshed = data.find((m) => m.id === method.id);
      if (refreshed) onUpdate(refreshed);
      setEditingFieldId(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al actualizar el campo");
    } finally {
      setSavingFieldId(null);
    }
  }

  async function handleDeleteField(fieldId: string, label: string) {
    if (!confirm(`¿Eliminar el campo "${label}"?`)) return;
    setDeletingFieldId(fieldId);
    setError(null);
    try {
      await api(`/api/admin/payment-methods/${method.id}/fields/${fieldId}`, { method: "DELETE" });
      const { data } = await api<AdminPaymentMethod[]>("/api/admin/payment-methods/");
      const refreshed = data.find((m) => m.id === method.id);
      if (refreshed) onUpdate(refreshed);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al eliminar el campo");
    } finally {
      setDeletingFieldId(null);
    }
  }

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 p-4 sm:p-5">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${method.is_active ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-400"}`}>
            <CreditCard size={16} className="sm:hidden" />
            <CreditCard size={18} className="hidden sm:block" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-slate-900 truncate text-sm sm:text-base">{method.name}</p>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full flex-shrink-0 ${method.is_active ? "bg-green-50 text-green-700 border border-green-200" : "bg-slate-100 text-slate-400 border border-slate-200"}`}>
                {method.is_active ? "Activo" : "Inactivo"}
              </span>
            </div>
            {method.description && <p className="text-xs font-medium text-slate-400 truncate mt-0.5">{method.description}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 self-end sm:self-auto">
          <button
            onClick={handleToggleActive}
            disabled={toggling}
            title={method.is_active ? "Desactivar" : "Activar"}
            className={`p-2 sm:p-2.5 rounded-xl border transition-all disabled:opacity-50 ${method.is_active ? "bg-white border-green-200 text-green-600 hover:bg-green-50" : "bg-white border-slate-200 text-slate-400 hover:bg-slate-100"}`}
          >
            {toggling ? <RefreshCw size={15} className="animate-spin" /> : <Power size={15} />}
          </button>
          <button onClick={() => onEdit(method)} title="Editar" className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 transition-all">
            <Edit2 size={15} />
          </button>
          <button onClick={handleDelete} disabled={deleting} title="Eliminar" className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-50">
            {deleting ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}
          </button>
          <button onClick={() => setExpanded((v) => !v)} title="Campos y valores" className="p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:bg-slate-100 transition-all">
            {expanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
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
            <div className="px-5 pb-5 pt-1 border-t border-slate-200 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3 mt-4">
                  {error}
                </div>
              )}

              {/* Campos del método */}
              <div className="space-y-3 mt-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Campos</p>
                {method.fields.length === 0 && (
                  <p className="text-sm font-medium text-slate-400">Este método no tiene campos configurados.</p>
                )}
                {method.fields.map((f) => (
                  <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-3">
                    {editingFieldId === f.id ? (
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
                        <input
                          type="text"
                          value={fieldDraft.field_label}
                          onChange={(e) => setFieldDraft({ ...fieldDraft, field_label: e.target.value })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                          placeholder="Etiqueta"
                        />
                        <select
                          value={fieldDraft.field_type}
                          onChange={(e) => setFieldDraft({ ...fieldDraft, field_type: e.target.value as PaymentMethodFieldType })}
                          className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                        >
                          {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                        </select>
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-500 px-2">
                          <input type="checkbox" checked={fieldDraft.is_required} onChange={(e) => setFieldDraft({ ...fieldDraft, is_required: e.target.checked })} />
                          Requerido
                        </label>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleSaveField(f.id)}
                            disabled={savingFieldId === f.id}
                            className="p-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-all disabled:opacity-50"
                          >
                            {savingFieldId === f.id ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                          </button>
                          <button type="button" onClick={() => setEditingFieldId(null)} className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <GripVertical size={14} className="text-slate-300 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800">
                            {f.field_label} <span className="text-slate-300 font-medium">· {f.field_key}</span>
                          </p>
                          <p className="text-[11px] font-medium text-slate-400">
                            {FIELD_TYPE_LABELS[f.field_type]}{f.is_required ? " · Requerido" : ""}
                          </p>
                        </div>
                        <button onClick={() => startEditField(f)} className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all">
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteField(f.id, f.field_label)}
                          disabled={deletingFieldId === f.id}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                          {deletingFieldId === f.id ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Agregar campo */}
                <form onSubmit={handleAddField} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center bg-white border border-dashed border-slate-300 rounded-xl p-3">
                  <input
                    type="text"
                    value={newField.field_key}
                    onChange={(e) => setNewField({ ...newField, field_key: e.target.value })}
                    placeholder="clave (ej. cedula)"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                  />
                  <input
                    type="text"
                    value={newField.field_label}
                    onChange={(e) => setNewField({ ...newField, field_label: e.target.value })}
                    placeholder="Etiqueta (ej. Cédula)"
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                  />
                  <select
                    value={newField.field_type}
                    onChange={(e) => setNewField({ ...newField, field_type: e.target.value as PaymentMethodFieldType })}
                    className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                  >
                    {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                  </select>
                  <label className="flex items-center gap-2 text-xs font-bold text-slate-500 px-2">
                    <input type="checkbox" checked={newField.is_required} onChange={(e) => setNewField({ ...newField, is_required: e.target.checked })} />
                    Requerido
                  </label>
                  <button
                    type="submit"
                    disabled={addingField || !newField.field_key.trim() || !newField.field_label.trim()}
                    className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {addingField ? <RefreshCw size={14} className="animate-spin" /> : <Plus size={14} />} Agregar
                  </button>
                </form>
              </div>

              {/* Valores configurados */}
              {method.fields.length > 0 && (
                <div className="space-y-3">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">Datos para mostrar al usuario</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {method.fields.map((f) => (
                      <div key={f.field_key} className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400 ml-1">{f.field_label}</label>
                        <input
                          type="text"
                          value={values[f.field_key] ?? ""}
                          onChange={(e) => setValues((prev) => ({ ...prev, [f.field_key]: e.target.value }))}
                          placeholder={f.field_label}
                          className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2.5 text-sm font-bold outline-none focus:border-indigo-300"
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleSaveValues}
                    disabled={savingValues}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all disabled:opacity-50"
                  >
                    {savingValues ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />} Guardar valores
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel principal
// ---------------------------------------------------------------------------

export default function PaymentMethodsPanel() {
  const api = useApiFetch();
  const [methods, setMethods] = useState<AdminPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draft, setDraft] = useState<MethodDraft>(EMPTY_METHOD_DRAFT);
  const [isSaving, setIsSaving] = useState(false);
  const [newFieldDraft, setNewFieldDraft] = useState<FieldDraft>(EMPTY_FIELD_DRAFT);

  const loadMethods = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api<AdminPaymentMethod[]>("/api/admin/payment-methods/");
      setMethods(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar los métodos de pago");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { loadMethods(); }, [loadMethods]);

  function openCreateModal() {
    setDraft({ ...EMPTY_METHOD_DRAFT, sort_order: methods.length });
    setNewFieldDraft(EMPTY_FIELD_DRAFT);
    setIsModalOpen(true);
  }

  function openEditModal(m: AdminPaymentMethod) {
    setDraft({
      id: m.id,
      name: m.name,
      description: m.description ?? "",
      is_active: m.is_active,
      sort_order: m.sort_order,
      fields: [],
    });
    setNewFieldDraft(EMPTY_FIELD_DRAFT);
    setIsModalOpen(true);
  }

  function addFieldToDraft() {
    if (!newFieldDraft.field_key.trim() || !newFieldDraft.field_label.trim()) return;
    setDraft((prev) => ({ ...prev, fields: [...prev.fields, newFieldDraft] }));
    setNewFieldDraft(EMPTY_FIELD_DRAFT);
  }

  function removeFieldFromDraft(index: number) {
    setDraft((prev) => ({ ...prev, fields: prev.fields.filter((_, i) => i !== index) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      if (draft.id) {
        const { data } = await api<AdminPaymentMethod>(`/api/admin/payment-methods/${draft.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name.trim(),
            description: draft.description.trim() || null,
            is_active: draft.is_active,
            sort_order: draft.sort_order,
          }),
        });
        setMethods((prev) => prev.map((m) => (m.id === data.id ? data : m)));
      } else {
        const { data } = await api<AdminPaymentMethod>("/api/admin/payment-methods/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: draft.name.trim(),
            description: draft.description.trim() || null,
            is_active: draft.is_active,
            sort_order: draft.sort_order,
            fields: draft.fields.map((f) => ({
              field_key: f.field_key.trim(),
              field_label: f.field_label.trim(),
              field_type: f.field_type,
              is_required: f.is_required,
            })),
          }),
        });
        setMethods((prev) => [...prev, data]);
      }
      setIsModalOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al guardar el método de pago");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-4 sm:p-6 md:p-10 border border-slate-200 shadow-sm"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
            <CreditCard className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /> Métodos de Pago
          </h3>
          <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">
            Configura los métodos de pago que verán los usuarios al registrarse.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <button onClick={loadMethods} disabled={loading} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl border-2 border-slate-200 text-xs sm:text-sm font-black text-slate-600 hover:bg-slate-50 transition-all disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Actualizar
          </button>
          <button onClick={openCreateModal} className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100">
            <Plus size={16} /> Nuevo método
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-2xl px-5 py-4 mb-6 flex items-center gap-2">
          {error}
        </div>
      )}

      {loading && methods.length === 0 ? (
        <div className="flex justify-center items-center py-16 text-slate-400">
          <RefreshCw size={24} className="animate-spin mr-3" />
          <span className="font-bold">Cargando métodos de pago...</span>
        </div>
      ) : methods.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <CreditCard size={40} className="mx-auto mb-4 opacity-30" />
          <p className="font-bold">No hay métodos de pago creados.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {methods.map((m) => (
            <PaymentMethodCard
              key={m.id}
              method={m}
              api={api}
              onUpdate={(updated) => setMethods((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))}
              onDelete={(id) => setMethods((prev) => prev.filter((x) => x.id !== id))}
              onEdit={openEditModal}
            />
          ))}
        </div>
      )}

      {/* Modal crear/editar método */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="relative bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg sm:text-xl font-black mb-5 sm:mb-6">{draft.id ? "Editar método de pago" : "Nuevo método de pago"}</h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Ej. Pago Móvil"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    placeholder="Descripción visible para el usuario (opcional)"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-indigo-500 resize-none"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1">Orden</label>
                    <input
                      type="number"
                      min={0}
                      value={draft.sort_order}
                      onChange={(e) => setDraft({ ...draft, sort_order: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="flex items-end pb-3">
                    <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                      <input type="checkbox" checked={draft.is_active} onChange={(e) => setDraft({ ...draft, is_active: e.target.checked })} />
                      Activo
                    </label>
                  </div>
                </div>

                {/* Campos iniciales — solo al crear */}
                {!draft.id && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Campos</label>
                    {draft.fields.map((f, i) => (
                      <div key={i} className="flex items-center justify-between gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                        <div className="text-sm">
                          <span className="font-bold text-slate-800">{f.field_label}</span>
                          <span className="text-slate-400 font-medium"> · {f.field_key} · {FIELD_TYPE_LABELS[f.field_type]}{f.is_required ? " · Requerido" : ""}</span>
                        </div>
                        <button type="button" onClick={() => removeFieldFromDraft(i)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-2 items-center bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3">
                      <input
                        type="text"
                        value={newFieldDraft.field_key}
                        onChange={(e) => setNewFieldDraft({ ...newFieldDraft, field_key: e.target.value })}
                        placeholder="clave (ej. cedula)"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                      />
                      <input
                        type="text"
                        value={newFieldDraft.field_label}
                        onChange={(e) => setNewFieldDraft({ ...newFieldDraft, field_label: e.target.value })}
                        placeholder="Etiqueta (ej. Cédula)"
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                      />
                      <select
                        value={newFieldDraft.field_type}
                        onChange={(e) => setNewFieldDraft({ ...newFieldDraft, field_type: e.target.value as PaymentMethodFieldType })}
                        className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none focus:border-indigo-300"
                      >
                        {FIELD_TYPES.map((t) => <option key={t} value={t}>{FIELD_TYPE_LABELS[t]}</option>)}
                      </select>
                      <label className="flex items-center gap-2 text-xs font-bold text-slate-500 px-2">
                        <input type="checkbox" checked={newFieldDraft.is_required} onChange={(e) => setNewFieldDraft({ ...newFieldDraft, is_required: e.target.checked })} />
                        Requerido
                      </label>
                      <button
                        type="button"
                        onClick={addFieldToDraft}
                        disabled={!newFieldDraft.field_key.trim() || !newFieldDraft.field_label.trim()}
                        className="flex items-center justify-center gap-1.5 bg-indigo-600 text-white px-3 py-2 rounded-lg font-bold text-xs hover:bg-indigo-700 transition-all disabled:opacity-50"
                      >
                        <Plus size={14} /> Agregar
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Podrás agregar, editar o eliminar campos más adelante desde la tarjeta del método.
                    </p>
                  </div>
                )}

                <div className="pt-4 flex gap-3">
                  <button type="submit" disabled={isSaving} className="flex-1 bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50">
                    {isSaving ? "Guardando..." : "Guardar"}
                  </button>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                    Cancelar
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
