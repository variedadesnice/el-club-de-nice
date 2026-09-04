import { useEffect, useState } from "react";
import { Gift, Trophy, CalendarClock, Star } from "lucide-react";
import { motion } from "motion/react";
import { useApiFetch } from "../../../lib/api";
import { Raffle } from "../../../types";

function formatDrawDate(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-ES", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" });
  } catch {
    return iso;
  }
}

function WinnerChip({ name, avatar, position }: { name: string; avatar?: string | null; position: number }) {
  return (
    <div className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-2xl pl-1.5 pr-3 py-1.5">
      {avatar ? (
        <img src={avatar} alt={name} className="w-7 h-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="w-7 h-7 rounded-full bg-white/20 text-white font-black text-xs flex items-center justify-center shrink-0">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
      <span className="text-xs font-bold text-white truncate max-w-36">{name}</span>
      {position === 1 && <Star size={12} className="text-amber-300 fill-amber-300 shrink-0" />}
    </div>
  );
}

export default function RaffleBanner() {
  const api = useApiFetch();
  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    api<Raffle | null>("/api/raffles/active")
      .then(({ data }) => setRaffle(data))
      .catch(() => setRaffle(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!raffle) return null;

  const tagLabel = raffle.is_active ? "🎉 Sorteo activo" : "🏆 ¡Tenemos ganadores!";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full relative overflow-hidden rounded-3xl border border-white/10 shadow-lg"
    >
      {/* Hero image */}
      {raffle.image_url && (
        <div className="relative w-full aspect-video sm:aspect-21/9">
          <img src={raffle.image_url} alt={raffle.title} className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
          <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-full bg-white/95 text-indigo-700 shadow-sm">
            {tagLabel}
          </span>
          <div className="absolute bottom-3 left-4 right-4">
            <h4 className="font-black text-white text-lg sm:text-2xl tracking-tight wrap-break-word drop-shadow-sm">
              {raffle.title}
            </h4>
            {raffle.is_active && (
              <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-white/20 backdrop-blur-sm text-white border border-white/30">
                <Trophy size={10} /> {raffle.winner_count} ganador{raffle.winner_count !== 1 ? "es" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="relative bg-gradient-to-r from-violet-600 via-indigo-600 to-fuchsia-600 p-4 sm:p-5">
        {!raffle.image_url && (
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path d="M0,40 C120,80 240,0 400,60 L400,100 L0,100 Z" fill="currentColor" className="text-white" />
          </svg>
        )}

        <div className={`relative z-10 ${raffle.image_url ? "" : "flex items-start gap-3 sm:gap-4"}`}>
          {!raffle.image_url && (
            <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center bg-white/20 text-white shrink-0 shadow-sm">
              {raffle.is_active ? <Gift size={20} strokeWidth={2.5} /> : <Trophy size={20} strokeWidth={2.5} />}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {!raffle.image_url && (
              <>
                <p className="text-[10px] font-black uppercase tracking-widest text-white/80">{tagLabel}</p>
                <h4 className="font-black text-white text-sm sm:text-base tracking-tight mt-0.5 wrap-break-word">
                  {raffle.title}
                </h4>
                {raffle.is_active && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full bg-white/20 text-white">
                    <Trophy size={10} /> {raffle.winner_count} ganador{raffle.winner_count !== 1 ? "es" : ""}
                  </span>
                )}
              </>
            )}
            {raffle.description && (
              <div className="mt-1.5">
                <p className={`text-xs sm:text-sm font-bold text-white/95 leading-relaxed ${!isExpanded ? 'line-clamp-2' : ''}`}>
                  {raffle.description}
                </p>
                {raffle.description.length > 100 && (
                  <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-white hover:text-pink-200 text-[10px] font-black uppercase tracking-wider mt-1 transition-colors underline underline-offset-2"
                  >
                    {isExpanded ? "Ver menos" : "Ver más"}
                  </button>
                )}
              </div>
            )}

            {raffle.is_active ? (
              raffle.draw_at && (
                <p className="text-[11px] font-bold text-white/80 mt-1.5 flex items-center gap-1">
                  <CalendarClock size={12} className="shrink-0" /> Se sortea el {formatDrawDate(raffle.draw_at)}
                </p>
              )
            ) : (
              <div className="flex flex-wrap gap-2 mt-3">
                {raffle.winners.map((w) => (
                  <WinnerChip key={w.id} name={w.name} avatar={w.avatar} position={w.position} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
