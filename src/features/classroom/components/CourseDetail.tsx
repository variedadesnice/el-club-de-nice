import React, { useState, useMemo, useRef } from "react";
import { ArrowLeft, PlayCircle, CheckCircle, Pencil, X, Trash2 } from "lucide-react";
import { Course } from "../../../types";
import { motion } from "motion/react";
import { useCourseChapters } from "../hooks/useCourseChapters";
import { useApiFetch } from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import { isAdmin } from "../../../lib/permissions";
import AddChapterForm from "./AddChapterForm";
import ChapterPdfsAdmin from "./ChapterPdfsAdmin";
import ActiveChapterPdfs from "./ActiveChapterPdfs";

interface CourseDetailProps {
  course: Course;
  onBack: () => void;
  onCourseUpdated?: () => void;
  onEdit?: () => void;
}

function toEmbedUrl(url: string): string | null {
  if (!url) return null;
  if (url.includes("youtube.com/embed")) return url;
  const watchMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (watchMatch) return `https://www.youtube.com/embed/${watchMatch[1]}`;
  return url;
}

export default function CourseDetail({ course, onBack, onCourseUpdated, onEdit }: CourseDetailProps) {
  const { chapters, isLoading, refetch } = useCourseChapters(course.id);
  const api = useApiFetch();
  const { user } = useAuth();
  
  const [activeChapterId, setActiveChapterId] = useState<string | null>(null);

  // Set initial active chapter if not set
  useMemo(() => {
    if (chapters.length > 0 && !activeChapterId) {
      setActiveChapterId(chapters[0].id);
    }
  }, [chapters, activeChapterId]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editVideoUrl, setEditVideoUrl] = useState("");
  const [editDuration, setEditDuration] = useState("");
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const activeChapter = chapters.find((ch) => ch.id === activeChapterId);
  const activeVideo = activeChapter?.videoUrl ? toEmbedUrl(activeChapter.videoUrl) : null;

  const handleChapterAdded = () => {
    refetch();
    onCourseUpdated?.();
  };

  function startEdit(ch: { id: string; title: string; videoUrl?: string | null; duration?: string | null }) {
    setEditingId(ch.id);
    setEditTitle(ch.title);
    setEditVideoUrl(ch.videoUrl ?? "");
    setEditDuration(ch.duration ?? "");
    setEditError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditError(null);
  }

  async function saveEdit(chapterId: string) {
    if (!editTitle.trim()) { setEditError("El título es obligatorio"); return; }
    setIsSavingEdit(true);
    setEditError(null);
    try {
      await api(`/api/courses/${course.id}/chapters/${chapterId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editTitle.trim(),
          videoUrl: editVideoUrl.trim() || null,
          duration: editDuration.trim() || null,
        }),
      });
      cancelEdit();
      refetch();
      onCourseUpdated?.();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al guardar");
    } finally {
      setIsSavingEdit(false);
    }
  }

  async function deleteChapter(chapterId: string) {
    if (!confirm("¿Estás seguro de que deseas eliminar este capítulo? Se perderá todo su contenido y progreso.")) return;
    
    setIsSavingEdit(true);
    setEditError(null);
    try {
      await api(`/api/admin/classroom/courses/${course.id}/chapters/${chapterId}`, {
        method: "DELETE",
      });
      cancelEdit();
      refetch();
      onCourseUpdated?.();
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error al eliminar capítulo");
    } finally {
      setIsSavingEdit(false);
    }
  }

  const userIsAdmin = isAdmin(user?.role);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-lg mx-auto lg:max-w-4xl space-y-5 pb-4"
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-slate-500 hover:text-violet-600 font-bold transition-colors text-sm"
        >
          <ArrowLeft size={18} /> Volver a cursos
        </button>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="ml-2 px-3 py-1 rounded-xl bg-violet-100 text-violet-700 font-bold text-xs hover:bg-violet-200 transition-colors"
          >
            Editar curso
          </button>
        )}
      </div>

      {activeVideo ? (
        <div className="rounded-3xl overflow-hidden aspect-video shadow-lg border-2 border-violet-100 bg-slate-900 relative">
          <iframe
            src={activeVideo}
            title={activeChapter?.title ?? course.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full border-0"
          />
        </div>
      ) : activeChapterId ? (
        <div className="rounded-3xl overflow-hidden aspect-video shadow-lg border-2 border-violet-100 bg-violet-50 flex flex-col items-center justify-center text-center p-6">
          <CheckCircle size={48} className="text-violet-300 mb-4" />
          <h3 className="text-lg font-black text-violet-900 mb-2">{activeChapter?.title}</h3>
          <p className="text-sm font-medium text-violet-600 max-w-sm">
            Este capítulo no tiene un video enlazado, pero puedes encontrar sus documentos o material de apoyo abajo.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl overflow-hidden aspect-video border-2 border-violet-100 bg-slate-100 flex items-center justify-center">
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover opacity-90"
          />
        </div>
      )}

      <div className="rounded-3xl border-2 border-violet-200 bg-sky-50/80 p-5 shadow-sm">
        <span className="inline-flex px-3 py-1 rounded-full bg-violet-500 text-white text-[10px] font-black uppercase tracking-wider">
          {course.category}
        </span>
        <h1 className="text-xl font-black text-slate-900 mt-3 leading-tight">{course.title}</h1>
        <p className="text-sm font-medium text-slate-600 mt-2 leading-relaxed">{course.description}</p>
      </div>

      <section className="rounded-3xl bg-white border border-slate-100 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-black text-slate-900">Capítulos</h3>

        {isLoading ? (
          <div className="py-6 flex justify-center">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : chapters.length === 0 ? (
          <p className="text-sm font-medium text-slate-500">
            {userIsAdmin
              ? "Este curso aún no tiene capítulos. Añade el primero abajo."
              : "Este curso todavía no tiene capítulos disponibles. ¡Vuelve pronto!"}
          </p>
        ) : (
          <div className="space-y-2">
            {chapters.map((ch) => {
              const isActive = activeChapterId === ch.id;
              const hasVideo = Boolean(ch.videoUrl);

              if (editingId === ch.id) {
                return (
                  <div
                    key={ch.id}
                    className="rounded-2xl border-2 border-violet-200 bg-violet-50/40 p-4 space-y-3"
                  >
                    <p className="text-sm font-black text-slate-900">Editar capítulo</p>

                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Título del capítulo *"
                      className="w-full bg-white rounded-xl py-2.5 px-3 text-sm font-bold outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <input
                      type="url"
                      value={editVideoUrl}
                      onChange={(e) => setEditVideoUrl(e.target.value)}
                      placeholder="URL del video (YouTube, opcional)"
                      className="w-full bg-white rounded-xl py-2.5 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-200"
                    />
                    <input
                      type="text"
                      value={editDuration}
                      onChange={(e) => setEditDuration(e.target.value)}
                      placeholder="Duración (ej. 10:00, opcional)"
                      className="w-full bg-white rounded-xl py-2.5 px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-violet-200"
                    />

                    {editError && (
                      <p className="text-xs font-medium text-red-600">{editError}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => saveEdit(ch.id)}
                        disabled={isSavingEdit}
                        className="flex-1 py-2.5 bg-brand-primary text-white text-sm font-bold rounded-xl disabled:opacity-50"
                      >
                        {isSavingEdit ? "Guardando..." : "Guardar título/video"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        disabled={isSavingEdit}
                        className="px-4 py-2.5 bg-white text-slate-600 text-sm font-bold rounded-xl border border-slate-200"
                      >
                        Cerrar edición
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteChapter(ch.id)}
                        disabled={isSavingEdit}
                        className="px-4 py-2.5 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-200 hover:bg-red-100 flex items-center justify-center"
                        title="Eliminar capítulo"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <ChapterPdfsAdmin chapterId={ch.id} />
                  </div>
                );
              }

              return (
                <div
                  key={ch.id}
                  className={`flex items-start gap-3 p-4 rounded-2xl border-2 transition-all ${
                    isActive
                      ? "border-violet-500 bg-violet-50 shadow-sm"
                      : "border-slate-100 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setActiveChapterId(ch.id)}
                    className="flex items-start gap-4 flex-1 text-left min-w-0 hover:opacity-80 transition-opacity"
                  >
                    <div className={`mt-0.5 shrink-0 ${isActive ? "text-emerald-500" : "text-slate-400"}`}>
                      {isActive ? <CheckCircle size={20} /> : <PlayCircle size={20} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className={`font-bold text-sm ${isActive ? "text-violet-900" : "text-slate-700"}`}>
                        {ch.title}
                      </h4>
                      {ch.duration && (
                        <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          {ch.duration}
                        </p>
                      )}
                      {!hasVideo && (
                        <p className="text-xs text-slate-400 mt-1">Sin video enlazado</p>
                      )}
                      
                      {isActive && <ActiveChapterPdfs chapterId={ch.id} />}
                    </div>
                  </button>

                  {userIsAdmin && (
                    <button
                      type="button"
                      onClick={() => startEdit(ch)}
                      className="shrink-0 p-1.5 rounded-lg text-slate-300 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                      title="Editar capítulo"
                    >
                      <Pencil size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {userIsAdmin && <AddChapterForm courseId={course.id} onAdded={handleChapterAdded} />}
      </section>
    </motion.div>
  );
}
