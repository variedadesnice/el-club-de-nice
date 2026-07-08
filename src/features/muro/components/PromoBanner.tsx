import { useEffect, useState } from "react";
import { ExternalLink, Megaphone } from "lucide-react";
import { motion } from "motion/react";
import { useApiFetch } from "../../../lib/api";
import { PromoBanner as PromoBannerType } from "../../../types";

export default function PromoBanner() {
  const api = useApiFetch();
  const [banner, setBanner] = useState<PromoBannerType | null>(null);

  useEffect(() => {
    api<PromoBannerType | null>("/api/promo-banners/active")
      .then(({ data }) => setBanner(data))
      .catch(() => setBanner(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!banner) return null;

  return (
    <motion.a
      href={banner.link_url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className="w-full relative overflow-hidden rounded-3xl border border-white/10 shadow-lg block group"
    >
      <div className="relative w-full aspect-video sm:aspect-21/9">
        <img
          src={banner.image_url}
          alt={banner.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10" />

        <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-white/95 text-indigo-700 shadow-sm">
          <Megaphone size={11} /> Patrocinado
        </span>

        <span className="absolute top-3 right-3 inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
          <ExternalLink size={14} />
        </span>

        <div className="absolute bottom-3 left-4 right-4">
          <h4 className="font-black text-white text-lg sm:text-2xl tracking-tight wrap-break-word drop-shadow-sm">
            {banner.title}
          </h4>
          <p className="text-xs sm:text-sm font-bold text-white/90 mt-1 leading-relaxed line-clamp-2">
            {banner.description}
          </p>
        </div>
      </div>
    </motion.a>
  );
}
