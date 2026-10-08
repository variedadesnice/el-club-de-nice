import { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePosts } from "../hooks/usePosts";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Spinner from "../../../shared/ui/Spinner";
import { API_BASE } from "../../../lib/api";
import banner from "../../../assets/banner.webp";
import RenewalBanner from "./RenewalBanner";
import RaffleBanner from "./RaffleBanner";
import PromoBanner from "./PromoBanner";

const CONTENT_CATEGORIES = [
  {
    key: "Cursos",
    label: "Cursos",
    desc: "Aprende a tu ritmo con nuestras clases",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 opacity-20 absolute right-2 bottom-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 38V14a2 2 0 0 1 2-2h28a2 2 0 0 1 2 2v24" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M4 38h40" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M20 18l8 6-8 6V18Z" fill="white"/>
      </svg>
    ),
  },
  {
    key: "Probando marcas",
    label: "Probando\nmarcas",
    desc: "Ponemos a prueba tus ingredientes favoritos",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 opacity-20 absolute right-2 bottom-0" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="16" stroke="white" strokeWidth="3"/>
        <path d="M16 24l5 5 11-11" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    key: "Guías digitales",
    label: "Guías\ndigitales",
    desc: "Recetas y guías paso a paso",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 opacity-20 absolute right-2 bottom-0" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="6" width="28" height="36" rx="3" stroke="white" strokeWidth="3"/>
        <path d="M16 16h16M16 22h16M16 28h10" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    key: "Laboratorios",
    label: "Laboratorios",
    desc: "Probando nuevos trucos en la cocina",
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 opacity-20 absolute right-2 bottom-0" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 6v16L10 36a4 4 0 0 0 3.6 5.7h20.8A4 4 0 0 0 38 36L30 22V6" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <path d="M15 6h18" stroke="white" strokeWidth="3" strokeLinecap="round"/>
        <circle cx="20" cy="34" r="2" fill="white"/>
        <circle cx="27" cy="38" r="1.5" fill="white"/>
      </svg>
    ),
  },
];

interface TagOption { id: string; name: string; }

export default function PostFeed() {
  const navigate = useNavigate();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<TagOption[]>([]);

  useEffect(() => {
    fetch(`${API_BASE}/api/tags`).then((r) => r.json()).then(setAllTags).catch(() => {});
  }, []);

  const toggleTag = (name: string) =>
    setSelectedTags((prev) => prev.includes(name) ? prev.filter((t) => t !== name) : [...prev, name]);

  const { posts, isLoading, isLoadingMore, hasMore, loadMore, createPost, reactToPost, deletePost, editPost, pinPost, incrementCommentCount } = usePosts(selectedTags);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef(loadMore);

  // Keep ref in sync without re-creating the observer
  useEffect(() => { loadMoreRef.current = loadMore; });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreRef.current(); },
      { rootMargin: "400px" } // preload 400px antes de llegar al fondo
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  if (isLoading) return <Spinner />;

  return (
    <div className="max-w-3xl mx-auto space-y-3 md:space-y-6 px-2 md:px-0 pb-6">
      {/* Hero Welcome Banner */}
      <div className="w-full overflow-hidden rounded-3xl border border-slate-100/80 shadow-sm">
        <img src={banner} alt="Welcome Banner" className="w-full h-auto object-cover" />
      </div>

      <RenewalBanner />
      <RaffleBanner />
      <PromoBanner />

      {/* Main Feed */}
      <div className="space-y-3 md:space-y-6">
        {/* Barra de filtro por tags */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0">Filtrar:</span>
            {allTags.map((tag) => (
              <button
                key={tag.id}
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  selectedTags.includes(tag.name)
                    ? "bg-violet-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-500 hover:bg-violet-50 hover:text-violet-600"
                }`}
              >
                #{tag.name}
              </button>
            ))}
            {selectedTags.length > 0 && (
              <button
                onClick={() => setSelectedTags([])}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-red-400 hover:bg-red-50 transition-all"
              >
                Limpiar
              </button>
            )}
          </div>
        )}

        {/* Accesos rápidos a categorías de contenido */}
        <div className="grid grid-cols-2 gap-3">
          {CONTENT_CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => navigate(`/classroom?category=${encodeURIComponent(cat.key)}`)}
              className="relative overflow-hidden flex flex-col items-start justify-end rounded-2xl bg-pink-500 hover:bg-pink-600 active:scale-[0.97] transition-all p-4 min-h-[90px] text-left shadow-md shadow-pink-500/20 group"
            >
              {cat.icon}
              <div className="relative z-10">
                <p className="text-white font-black text-sm leading-tight uppercase tracking-wide whitespace-pre-line">
                  ❯ {cat.label}
                </p>
                <p className="text-pink-100 text-[11px] font-medium mt-0.5 leading-snug">
                  {cat.desc}
                </p>
              </div>
            </button>
          ))}
        </div>

        <CreatePost onSubmit={createPost} />

        {posts.map((post, idx) => (
          <PostCard
              key={post.id}
              post={post}
              index={idx}
              onReact={reactToPost}
              onDelete={deletePost}
              onEdit={editPost}
              onPin={pinPost}
              onCommentAdded={incrementCommentCount}
            />
        ))}

        {/* Sentinel: el observer dispara loadMore cuando este div entra en vista */}
        <div ref={sentinelRef} />

        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className="text-center text-xs font-bold text-slate-400 uppercase tracking-widest py-4">
            Has visto todos los posts
          </p>
        )}
      </div>
    </div>
  );
}
