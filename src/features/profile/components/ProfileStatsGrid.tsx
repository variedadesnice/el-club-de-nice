import React from "react";
import { BookOpen, Flame, Trophy, Users } from "lucide-react";
import { PROFILE_STATS } from "../data/profileMock";

const iconMap = {
  flame: Flame,
  users: Users,
  book: BookOpen,
  trophy: Trophy,
};

interface Props {
  badgeCount?: number;
  streakDays?: number;
  completedCourses?: number;
  socialImpact?: number;
}

export default function ProfileStatsGrid({ badgeCount, streakDays, completedCourses, socialImpact }: Props) {
  const stats = PROFILE_STATS.map((s) => {
    if (s.label === "Insignias" && badgeCount !== undefined) {
      return { ...s, value: String(badgeCount) };
    }
    if (s.label === "Días de Racha" && streakDays !== undefined) {
      return { ...s, value: String(streakDays), comingSoon: false, bg: "bg-orange-100", iconColor: "text-orange-500" };
    }
    if (s.label === "Cursos Completados" && completedCourses !== undefined) {
      return { ...s, value: String(completedCourses), comingSoon: false, bg: "bg-violet-100", iconColor: "text-violet-600" };
    }
    if (s.label === "Impacto Social" && socialImpact !== undefined) {
      return { ...s, value: String(socialImpact), comingSoon: false, bg: "bg-emerald-100", iconColor: "text-emerald-600" };
    }
    return s;
  });

  return (
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => {
        const Icon = iconMap[stat.icon];
        const comingSoon = "comingSoon" in stat && stat.comingSoon;
        return (
          <div
            key={stat.label}
            className={`${stat.bg} rounded-3xl p-5 flex flex-col items-center text-center shadow-sm border border-white/60 relative`}
          >
            {comingSoon && (
              <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider text-slate-400 bg-white/80 px-2 py-0.5 rounded-full">
                Pronto
              </span>
            )}
            <div className={`mb-3 ${stat.iconColor}`}>
              <Icon size={22} strokeWidth={2.25} />
            </div>
            {comingSoon ? (
              <p className="text-sm font-black text-slate-400 leading-none">{stat.value}</p>
            ) : (
              <p className="text-2xl font-black text-slate-900 leading-none">{stat.value}</p>
            )}
            <p className="text-[11px] font-bold text-slate-600 mt-2 leading-tight">{stat.label}</p>
          </div>
        );
      })}
    </div>
  );
}
