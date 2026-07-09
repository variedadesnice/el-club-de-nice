import React from "react";
import { BookOpen, Flame, Trophy, Users } from "lucide-react";

interface Props {
  badgeCount?: number;
  streakDays?: number;
  completedCourses?: number;
  socialImpact?: number;
}

const STAT_CONFIG = [
  { key: "streakDays", label: "Días de Racha", icon: Flame, bg: "bg-orange-100", iconColor: "text-orange-500" },
  { key: "socialImpact", label: "Impacto Social", icon: Users, bg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { key: "completedCourses", label: "Cursos Completados", icon: BookOpen, bg: "bg-violet-100", iconColor: "text-violet-600" },
  { key: "badgeCount", label: "Insignias", icon: Trophy, bg: "bg-sky-100", iconColor: "text-sky-600" },
] as const;

export default function ProfileStatsGrid({ badgeCount, streakDays, completedCourses, socialImpact }: Props) {
  const values: Record<(typeof STAT_CONFIG)[number]["key"], number | undefined> = {
    streakDays,
    socialImpact,
    completedCourses,
    badgeCount,
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {STAT_CONFIG.map((stat) => {
        const Icon = stat.icon;
        const value = values[stat.key];
        const isLoading = value === undefined;
        return (
          <div
            key={stat.key}
            className={`${stat.bg} rounded-3xl p-5 flex flex-col items-center text-center shadow-sm border border-white/60`}
          >
            <div className={`mb-3 ${stat.iconColor}`}>
              <Icon size={22} strokeWidth={2.25} />
            </div>
            {isLoading ? (
              <div className="h-7 w-10 bg-white/70 rounded-lg animate-pulse" />
            ) : (
              <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
            )}
            <p className="text-[11px] font-bold text-slate-600 mt-2 leading-tight">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
