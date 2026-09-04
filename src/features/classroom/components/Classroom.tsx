import React, { useState } from "react";
import { Plus } from "lucide-react";
import { useCourses } from "../hooks/useCourses";
import { useAuth } from "../../../context/AuthContext";
import { requireAdmin, isAdmin } from "../../../lib/permissions";
import CourseCard from "./CourseCard";
import CourseDetail from "./CourseDetail";
import CreateCourseSheet from "./CreateCourseSheet";
import Spinner from "../../../shared/ui/Spinner";
import { Course } from "../../../types";

export default function Classroom() {
  const { user } = useAuth();
  const userIsAdmin = isAdmin(user?.role);
  const { courses, isLoading, error, refetch } = useCourses();
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  React.useEffect(() => {
    if (selectedCourse) {
      const updated = courses.find((c) => c.id === selectedCourse.id);
      if (updated) {
        setSelectedCourse(updated);
      } else {
        setSelectedCourse(null);
      }
    }
  }, [courses, selectedCourse?.id]);

  if (isLoading) return <Spinner />;

  if (selectedCourse) {
    return (
      <CourseDetail
        course={selectedCourse}
        onBack={() => setSelectedCourse(null)}
        onCourseUpdated={refetch}
        onEdit={
          userIsAdmin
            ? () => {
                setEditingCourse(selectedCourse);
                setShowCreate(true);
              }
            : undefined
        }
      />
    );
  }

  return (
    <>
      <div className="max-w-lg mx-auto lg:max-w-5xl space-y-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Contenido</h1>
            <p className="text-sm font-medium text-slate-500 mt-1">Tus cursos y lecciones disponibles</p>
          </div>
          {userIsAdmin && (
            <button
              type="button"
              onClick={() => { if (requireAdmin(user?.role, "subir cursos")) setShowCreate(true); }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-brand-primary text-white text-sm font-bold shadow-md shadow-violet-950/10 hover:bg-brand-primary-hover active:scale-[0.98] transition-all shrink-0"
            >
              <Plus size={18} /> <span className="hidden sm:inline">Nuevo Curso</span>
            </button>
          )}
        </header>

        {error && (
          <div className="rounded-3xl border-2 border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="rounded-3xl border-2 border-violet-200 bg-sky-50/80 p-8 text-center">
            <p className="font-bold text-slate-700">
              {userIsAdmin ? "No hay cursos todavía" : "Todavía no hay cursos publicados"}
            </p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              {userIsAdmin
                ? "Crea tu primer curso con nombre, descripción e imagen."
                : "Estamos preparando contenido nuevo. ¡Vuelve pronto!"}
            </p>
            {userIsAdmin && (
              <button
                type="button"
                onClick={() => { if (requireAdmin(user?.role, "subir cursos")) setShowCreate(true); }}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary text-white text-sm font-bold"
              >
                <Plus size={18} /> Subir curso
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {courses.map((course, idx) => (
              <CourseCard
                key={course.id}
                course={course}
                index={idx}
                onClick={() => setSelectedCourse(course)}
                onEdit={
                  userIsAdmin
                    ? () => {
                        setEditingCourse(course);
                        setShowCreate(true);
                      }
                    : undefined
                }
              />
            ))}
          </div>
        )}
      </div>

      <CreateCourseSheet
        open={showCreate}
        onClose={() => {
          setShowCreate(false);
          setEditingCourse(null);
        }}
        onCreated={refetch}
        course={editingCourse}
      />
    </>
  );
}
