import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LayoutGrid, Plus, RefreshCw, Trash2, X, Power, Pencil } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import type { ContentCategory, ContentCategoryIcon } from "../../types";

// Las claves deben coincidir con el CHECK de content_categories.icon y con los
// dibujos de los atajos en Comunidad (PostFeed).
const ICON_OPTIONS: { value: ContentCategoryIcon; label: string }[] = [
  { value: "play", label: "▶ Video / clase" },
  { value: "check", label: "✓ Prueba / reseña" },
  { value: "doc", label: "▤ Guía / documento" },
  { value: "flask", label: "⚗ Experimento" },
];

interface CategoryFormState {
  name: string;
  description: string;
  icon: ContentCategoryIcon;
  sortOrder: string;
}

const EMPTY_FORM: CategoryFormState = { name: "", description: "", icon: "play", sortOrder: "0" };

function CategoryCard({
  category,
  onEdit,
  onToggle,
  onDelete,
  togglingId,
  deletingId,
}: {
  category: ContentCategory;
  onEdit: (c: ContentCategory) => void;
  onToggle: (c: ContentCategory) => void;
  onDelete: (c: ContentCategory) => void;
  togglingId: string | null;
  deletingId: string | null;
}) {
  const isToggling = togglingId === category.id;
  const isDeleting = deletingId === category.id;
  const courseCount = category.course_count ?? 0;

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl border ${
        category.is_active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"
      }`}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-black text-slate-900 text-sm truncate">{category.name}</p>
          <span
            className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
              category.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"
            }`}
          >
            {category.is_active ? "Activa" : "Inactiva"}
          </span>
        </div>
        {category.description && (
          <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{category.description}</p>
        )}
        <p className="text-[11px] font-bold text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-600">
            {courseCount} contenido{courseCount === 1 ? "" : "s"}
          </span>
          <span>·</span>
          <span>Orden {category.sort_order}</span>
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onEdit(category)}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          title="Editar categoría"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onToggle(category)}
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50 ${
            category.is_active
              ? "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isToggling ? <RefreshCw size={13} className="animate-spin" /> : <Power size={13} />}
          {category.is_active ? "Desactivar" : "Activar"}
        </button>
        <button
          onClick={() => onDelete(category)}
          disabled={isDeleting || courseCount > 0}
          className="p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-400"
          title={courseCount > 0 ? "Tiene contenidos: muévelos o desactívala" : "Eliminar categoría"}
        >
          {isDeleting ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </div>
  );
}

export default function ContentCategoriesPanel() {
  const api = useApiFetch();
  const [categories, setCategories] = useState<ContentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // null = modal cerrado · ContentCategory = editando esa · "new" = creando una nueva
  const [editing, setEditing] = useState<ContentCategory | "new" | null>(null);
  const [form, setForm] = useState<CategoryFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const sortByOrder = (list: ContentCategory[]) => [...list].sort((a, b) => a.sort_order - b.sort_order);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api<ContentCategory[]>("/api/admin/content-categories/");
      setCategories(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar las categorías");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    const nextOrder = categories.reduce((max, c) => Math.max(max, c.sort_order), -1) + 1;
    setForm({ ...EMPTY_FORM, sortOrder: String(nextOrder) });
    setSaveError(null);
    setEditing("new");
  }

  function openEdit(category: ContentCategory) {
    setForm({
      name: category.name,
      description: category.description ?? "",
      icon: category.icon,
      sortOrder: String(category.sort_order),
    });
    setSaveError(null);
    setEditing(category);
  }

  function closeModal() {
    if (saving) return;
    setEditing(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;

    const sortOrder = Number(form.sortOrder);
    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      setSaveError("El orden debe ser un número entero mayor o igual a 0.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      icon: form.icon,
      sort_order: sortOrder,
    };

    setSaving(true);
    setSaveError(null);
    try {
      if (editing === "new") {
        const { data } = await api<ContentCategory>("/api/admin/content-categories/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, is_active: true }),
        });
        setCategories(prev => sortByOrder([...prev, data]));
      } else {
        const { data } = await api<ContentCategory>(`/api/admin/content-categories/${editing.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        setCategories(prev => sortByOrder(prev.map(c => (c.id === data.id ? data : c))));
      }
      setEditing(null);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Error al guardar la categoría");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggle(category: ContentCategory) {
    setTogglingId(category.id);
    setError(null);
    try {
      const { data } = await api<ContentCategory>(`/api/admin/content-categories/${category.id}/toggle`, { method: "PATCH" });
      setCategories(prev => prev.map(c => (c.id === data.id ? data : c)));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cambiar el estado de la categoría");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(category: ContentCategory) {
    if (!confirm(`¿Eliminar la categoría "${category.name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(category.id);
    setError(null);
    try {
      await api(`/api/admin/content-categories/${category.id}`, { method: "DELETE" });
      setCategories(prev => prev.filter(c => c.id !== category.id));
    } catch (e: unknown) {
      // 409 = tiene contenidos; lo que corresponde es moverlos o desactivarla.
      setError(e instanceof Error ? e.message : "Error al eliminar la categoría");
    } finally {
      setDeletingId(null);
    }
  }

  const isCreating = editing === "new";
  const renaming = !isCreating && editing !== null && form.name.trim() !== editing.name;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
              <LayoutGrid className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /> Categorías de Contenido
            </h3>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Las activas son los atajos de Comunidad y las pestañas de Classroom.
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
              <Plus size={15} /> Nueva categoría
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
            <span className="font-bold">Cargando categorías...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <LayoutGrid size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Aún no hay categorías creadas.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {categories.map(c => (
              <CategoryCard
                key={c.id}
                category={c}
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
                  {isCreating ? "Nueva Categoría" : "Editar Categoría"}
                </h2>
                <button onClick={closeModal} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                      Nombre
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={60}
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ej. Laboratorios"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
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
                {renaming && (editing as ContentCategory).course_count ? (
                  <p className="text-[11px] font-medium text-amber-600 -mt-3">
                    Sus {(editing as ContentCategory).course_count} contenido(s) pasarán a la categoría nueva automáticamente.
                  </p>
                ) : null}

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Descripción del atajo (opcional)
                  </label>
                  <input
                    type="text"
                    maxLength={120}
                    value={form.description}
                    onChange={e => setForm({ ...form, description: e.target.value })}
                    placeholder="Ej. Probando nuevos trucos en la cocina"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Ícono del atajo
                  </label>
                  <select
                    value={form.icon}
                    onChange={e => setForm({ ...form, icon: e.target.value as ContentCategoryIcon })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  >
                    {ICON_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
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
                    disabled={saving || !form.name.trim()}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {saving ? (
                      <><RefreshCw size={16} className="animate-spin" /> Guardando...</>
                    ) : (
                      <><LayoutGrid size={16} /> {isCreating ? "Crear categoría" : "Guardar cambios"}</>
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
