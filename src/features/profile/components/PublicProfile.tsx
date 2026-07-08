import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, MapPin, Flame, BookOpen, Users, Trophy, Award } from "lucide-react";
import { useApiFetch } from "../../../lib/api";
import type { PublicUserProfile } from "../../../types";
import ProfileLevelCard from "./ProfileLevelCard";
import ProfileAchievements, { UserAchievement, groupAchievements } from "./ProfileAchievements";

interface Props {
  userId: string;
  onClose: () => void;
}

function StatBox({
  icon: Icon,
  value,
  label,
  color,
  bg,
}: {
  icon: React.ElementType;
  value: number | undefined;
  label: string;
  color: string;
  bg: string;
}) {
  return (
    <div className={`${bg} rounded-2xl p-4 flex flex-col items-center text-center`}>
      <div className={`mb-2 ${color}`}>
        <Icon size={18} strokeWidth={2.25} />
      </div>
      {value === undefined ? (
        <div className="w-8 h-5 bg-white/60 rounded animate-pulse mx-auto mb-1" />
      ) : (
        <p className="text-xl font-black text-slate-900 leading-none">{value}</p>
      )}
      <p className="text-[10px] font-bold text-slate-600 mt-1.5 leading-tight">{label}</p>
    </div>
  );
}

export default function PublicProfile({ userId, onClose }: Props) {
  const api = useApiFetch();
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api<PublicUserProfile>(`/api/users/${userId}/profile`)
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(err instanceof Error ? err.message : "No se pudo cargar el perfil."))
      .finally(() => setLoading(false));
  }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

  const tierIcon =
    profile?.level?.tier?.icon_url ||
    (profile?.level?.tier as any)?.icon ||
    (profile?.level?.tier as any)?.image_url;

  const subtitle = profile?.bio
    ? `${profile.bio}${profile.level ? ` • Nivel ${profile.level.level}` : ""}`
    : profile?.level
    ? `Nivel ${profile.level.level}`
    : undefined;

  // Adapt achievements to the flat shape ProfileAchievements expects
  const achievements: UserAchievement[] = (profile?.achievements ?? [])
    .filter((a) => a.achievement)
    .map((a) => ({
      id: a.id,
      code: a.achievement!.code,
      name: a.achievement!.name,
      description: a.achievement!.description,
      xp_reward: a.achievement!.xp_reward,
      icon_url: a.achievement!.icon_url,
      obtained_at: a.earned_at,
    }));

  return (
    <AnimatePresence>
      {/* Backdrop */}
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <motion.div
        key="drawer"
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 overflow-y-auto shadow-2xl flex flex-col"
      >
        {/* Close button */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 pt-5 pb-3 bg-white/90 backdrop-blur-sm border-b border-slate-100">
          <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Perfil</p>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
            aria-label="Cerrar perfil"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          {loading && (
            <div className="flex items-center justify-center py-24">
              <div className="w-8 h-8 border-4 border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="mx-5 mt-8 rounded-2xl bg-red-50 border border-red-100 p-5 text-center">
              <p className="text-sm font-bold text-red-500">{error}</p>
            </div>
          )}

          {!loading && profile && (
            <>
              {/* Hero / Avatar banner */}
              <div>
                {/* Banner */}
                <div className="relative h-28 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-500" />
                  <svg className="absolute inset-0 w-full h-full opacity-90" viewBox="0 0 400 112" preserveAspectRatio="none" aria-hidden>
                    <path d="M0,56 C80,14 160,84 240,42 C300,14 360,70 400,28 L400,112 L0,112 Z" fill="rgba(255,255,255,0.15)" />
                    <path d="M0,70 C100,28 200,91 320,49 C360,35 380,63 400,56 L400,112 L0,112 Z" fill="rgba(0,0,0,0.08)" />
                  </svg>
                </div>

                {/* Avatar + name */}
                <div className="flex flex-col items-center -mt-12 px-5 pb-2">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-[4px] border-white shadow-xl overflow-hidden bg-violet-50">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name ?? "Usuario"} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-violet-600 font-black text-3xl bg-violet-100">
                          {profile.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                    </div>
                    {tierIcon ? (
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 flex items-center justify-center drop-shadow-lg">
                        <img src={tierIcon} alt="Nivel" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-violet-500 border-[3px] border-white flex items-center justify-center text-white shadow-md">
                        <Award size={14} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  <h1 className="mt-4 text-xl font-black text-slate-900 tracking-tight text-center">
                    {profile.name ?? "Usuario"}
                  </h1>
                  {subtitle && (
                    <p className="mt-1 text-xs font-medium text-slate-500 text-center">{subtitle}</p>
                  )}

                  {/* Ciudad */}
                  {profile.city && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-slate-400">
                      <MapPin size={12} />
                      {profile.city}
                    </div>
                  )}

                  {/* Role badge */}
                  {profile.role && (
                    <span className="mt-2 px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-[10px] font-black uppercase tracking-wider">
                      {profile.role}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="px-5 mt-5 space-y-5">
                <div className="grid grid-cols-2 gap-3">
                  <StatBox icon={Flame} value={profile.streak.current_streak} label="Días de Racha" color="text-orange-500" bg="bg-orange-50" />
                  <StatBox icon={Trophy} value={groupAchievements(achievements).length} label="Insignias" color="text-amber-500" bg="bg-amber-50" />
                  <StatBox icon={BookOpen} value={profile.completed_courses} label="Cursos Completados" color="text-violet-600" bg="bg-violet-50" />
                  <StatBox icon={Users} value={profile.social_impact} label="Impacto Social" color="text-emerald-600" bg="bg-emerald-50" />
                </div>

                {/* Nivel */}
                {profile.level && (
                  <ProfileLevelCard
                    level={profile.level.level}
                    xpCurrent={profile.level.xp_current}
                    xpNext={profile.level.xp_next}
                    tierName={profile.level.tier?.name}
                    tierDescription={profile.level.tier?.description}
                    tierIcon={tierIcon}
                    loading={false}
                  />
                )}

                {/* Logros */}
                {achievements.length > 0 && (
                  <ProfileAchievements achievements={achievements} loading={false} />
                )}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
