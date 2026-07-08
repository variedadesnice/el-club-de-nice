import React, { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Megaphone, Plus, RefreshCw, Trash2, X, Camera, Link as LinkIcon, Power } from "lucide-react";
import { useApiFetch } from "../../lib/api";
import { PromoBanner } from "../../types";

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function BannerCard({
  banner,
  onDelete,
  onToggleActive,
  togglingId,
}: {
  banner: PromoBanner;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, next: boolean) => void;
  togglingId: string | null;
}) {
  const [deleting, setDeleting] = useState(false);
  const isToggling = togglingId === banner.id;

  async function handleDelete() {
    if (!confirm(`¿Eliminar el banner "${banner.title}"? Esta acción no se puede deshacer.`)) return;
    setDeleting(true);
    onDelete(banner.id);
  }

  return (
    <div className={`flex items-center gap-3 p-4 rounded-2xl border ${banner.is_active ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
      <img src={banner.image_url} alt={banner.title} className="w-14 h-14 rounded-xl object-cover shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-black text-slate-900 text-sm truncate">{banner.title}</p>
          <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${banner.is_active ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-500"}`}>
            {banner.is_active ? "Activo" : "Inactivo"}
          </span>
        </div>
        <p className="text-xs font-medium text-slate-500 truncate mt-0.5">{banner.description}</p>
        <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1 truncate">
          <LinkIcon size={10} className="shrink-0" /> {banner.link_url} · {formatDate(banner.created_at)}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => onToggleActive(banner.id, !banner.is_active)}
          disabled={isToggling}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all disabled:opacity-50 ${
            banner.is_active
              ? "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isToggling ? <RefreshCw size={13} className="animate-spin" /> : <Power size={13} />}
          {banner.is_active ? "Desactivar" : "Activar"}
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
  );
}

export default function PromoBannersPanel() {
  const api = useApiFetch();
  const [banners, setBanners] = useState<PromoBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const { data } = await api<PromoBanner[]>("/api/admin/promo-banners/");
      setBanners(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al cargar los banners");
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  function openModal() {
    setTitle("");
    setDescription("");
    setLinkUrl("");
    setImagePreview("");
    setImageUrl("");
    setSaveError(null);
    setIsModalOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage(true);
    setSaveError(null);

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const maxWidth = 1000;
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setImagePreview(dataUrl);

        api<{ url: string }>("/api/admin/promo-banners/image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageData: dataUrl }),
        })
          .then(({ data }) => setImageUrl(data.url))
          .catch((err) => {
            setSaveError(err instanceof Error ? err.message : "Error al subir imagen");
            setImagePreview("");
          })
          .finally(() => setIsUploadingImage(false));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !linkUrl.trim() || !imageUrl) return;
    setSaving(true);
    setSaveError(null);
    try {
      const { data } = await api<PromoBanner>("/api/admin/promo-banners/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          link_url: linkUrl.trim(),
        }),
      });
      setBanners(prev => [data, ...prev]);
      setIsModalOpen(false);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : "Error al crear el banner");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(id: string, next: boolean) {
    setTogglingId(id);
    setError(null);
    try {
      const { data } = await api<PromoBanner>(`/api/admin/promo-banners/${id}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: next }),
      });
      setBanners(prev => prev.map(b => {
        if (b.id === id) return data;
        return next ? { ...b, is_active: false } : b;
      }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al actualizar el banner");
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string) {
    try {
      await api(`/api/admin/promo-banners/${id}`, { method: "DELETE" });
      setBanners(prev => prev.filter(b => b.id !== id));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Error al eliminar el banner");
    }
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="bg-white rounded-3xl sm:rounded-[2rem] md:rounded-[2.5rem] p-5 sm:p-6 md:p-10 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-lg sm:text-2xl font-black text-slate-900 flex items-center gap-2 sm:gap-3">
              <Megaphone className="text-indigo-600 w-5 h-5 sm:w-6 sm:h-6" /> Banners Publicitarios
            </h3>
            <p className="text-slate-500 font-medium mt-1 text-sm">
              Solo un banner puede estar activo a la vez en Comunidad.
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
              onClick={openModal}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 sm:px-5 py-2.5 rounded-2xl font-black text-xs sm:text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
            >
              <Plus size={15} /> Nuevo banner
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
            <span className="font-bold">Cargando banners...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <Megaphone size={36} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">Aún no hay banners creados.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {banners.map(b => (
              <BannerCard key={b.id} banner={b} onDelete={handleDelete} onToggleActive={handleToggleActive} togglingId={togglingId} />
            ))}
          </div>
        )}
      </div>

      {/* Create modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !saving && setIsModalOpen(false)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl my-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">Nuevo Banner</h2>
                <button onClick={() => !saving && setIsModalOpen(false)} className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Título
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ej. 20% de descuento este mes"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Descripción
                  </label>
                  <textarea
                    required
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Ej. Aprovecha nuestra promo especial en cursos seleccionados"
                    rows={2}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Imagen
                  </label>
                  <label className="flex items-center gap-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl px-4 py-3 cursor-pointer hover:border-indigo-300 transition-colors">
                    {imagePreview ? (
                      <img src={imagePreview} alt="Vista previa" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center shrink-0 text-slate-400">
                        <Camera size={16} />
                      </div>
                    )}
                    <span className="text-xs font-bold text-slate-500">
                      {isUploadingImage ? "Subiendo..." : imageUrl ? "Cambiar imagen" : "Elegir imagen"}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploadingImage} />
                  </label>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Link de destino
                  </label>
                  <div className="relative">
                    <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    <input
                      type="url"
                      required
                      value={linkUrl}
                      onChange={e => setLinkUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                {saveError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl px-4 py-3">
                    {saveError}
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => !saving && setIsModalOpen(false)}
                    disabled={saving}
                    className="flex-1 px-4 py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || isUploadingImage || !title.trim() || !description.trim() || !linkUrl.trim() || !imageUrl}
                    className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-3 rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-200"
                  >
                    {saving ? (
                      <><RefreshCw size={16} className="animate-spin" /> Creando...</>
                    ) : (
                      <><Megaphone size={16} /> Crear banner</>
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
