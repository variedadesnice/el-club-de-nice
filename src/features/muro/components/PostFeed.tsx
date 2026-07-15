import { useRef, useEffect, useState } from "react";
import { usePosts } from "../hooks/usePosts";
import CreatePost from "./CreatePost";
import PostCard from "./PostCard";
import Spinner from "../../../shared/ui/Spinner";
import { API_BASE } from "../../../lib/api";
import banner from "../../../assets/banner.webp";
import RenewalBanner from "./RenewalBanner";
import RaffleBanner from "./RaffleBanner";
import PromoBanner from "./PromoBanner";

interface TagOption { id: string; name: string; }

export default function PostFeed() {
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
