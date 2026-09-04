import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView, useMotionValue, useSpring } from "motion/react";
import {
  Play,
  Users,
  Zap,
  ArrowRight,
  ShieldCheck,
  Star,
  BookOpen,
  Video,
  Award,
  ChevronRight,
  Sparkles,
  Heart,
  MessageCircle,
  TrendingUp,
  Lock,
  Check,
  ChevronDown,
  Calendar,
  RefreshCw,
  Instagram,
  Youtube,
  Palette,
  Clock,
  BadgeCheck,
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarFeat1 from "../../assets/avatars/feat1.jpg";
import avatarFeat2 from "../../assets/avatars/feat2.jpg";
import avatarFeat3 from "../../assets/avatars/feat3.jpg";
import avatarAuth1 from "../../assets/avatars/auth1.jpg";
import avatarAuth2 from "../../assets/avatars/auth2.jpg";
import avatarAuth3 from "../../assets/avatars/auth3.jpg";
import avatarAuth4 from "../../assets/avatars/auth4.jpg";
import nicePerfil from "../../assets/contenido/nice de perfil.png";
import { apiFetch, API_BASE } from "../../lib/api";
import type { Plan } from "../../types";

interface LandingProps {
  onViewChange: (view: "login" | "register") => void;
}

// ─── Animated Counter ──────────────────────────────────────────────────────────
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1800, bounce: 0 });
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (isInView) motionValue.set(target);
  }, [isInView, motionValue, target]);

  useEffect(() => {
    return spring.on("change", (v) => {
      setDisplay(
        v >= 1000
          ? (v / 1000).toFixed(v % 1000 === 0 ? 0 : 1) + "k"
          : Math.round(v).toString()
      );
    });
  }, [spring]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}

// ─── Feature Card ──────────────────────────────────────────────────────────────
function FeatureCard({
  icon,
  title,
  description,
  accent = false,
  large = false,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent?: boolean;
  large?: boolean;
  className?: string;
}) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`relative rounded-3xl p-8 flex flex-col gap-4 overflow-hidden border ${
        accent
          ? "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400 text-white shadow-lg shadow-pink-200"
          : "bg-white border-slate-200 text-slate-900 shadow-sm"
      } ${large ? "justify-end min-h-[280px]" : "justify-between min-h-[220px]"} ${className}`}
    >
      {accent && (
        <>
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-rose-400/20 rounded-full blur-xl" />
        </>
      )}
      <div
        className={`relative z-10 w-12 h-12 rounded-2xl flex items-center justify-center ${
          accent ? "bg-white/20" : "bg-pink-100"
        }`}
      >
        <div className={accent ? "text-white" : "text-pink-500"}>{icon}</div>
      </div>
      <div className="relative z-10">
        <h3
          className={`font-black text-xl mb-2 ${
            accent ? "text-white" : "text-slate-900"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm font-medium leading-relaxed ${
            accent ? "text-pink-50" : "text-slate-600"
          }`}
        >
          {description}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Testimonial Card ──────────────────────────────────────────────────────────
function TestimonialCard({
  avatar,
  name,
  role,
  text,
  delay = 0,
}: {
  avatar: string;
  name: string;
  role: string;
  text: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
      className="bg-white border border-slate-200 rounded-3xl p-7 flex flex-col gap-5 shadow-sm"
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="text-pink-400 fill-pink-400" />
        ))}
      </div>
      <p className="text-slate-600 text-sm font-medium leading-relaxed flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border-2 border-pink-200"
        />
        <div>
          <p className="text-slate-900 font-bold text-sm">{name}</p>
          <p className="text-slate-500 text-xs font-medium">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── FAQ Item ──────────────────────────────────────────────────────────────────
function FaqItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      className="border border-slate-200 bg-white rounded-2xl overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 hover:bg-slate-50 transition-colors"
      >
        <span className="font-bold text-slate-900 text-sm md:text-base leading-snug">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-pink-500" />
        </motion.div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="px-7 pb-6 text-sm text-slate-600 font-medium leading-relaxed">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Plan Card ─────────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  highlighted,
  onSelect,
}: {
  plan: Plan;
  highlighted: boolean;
  onSelect: () => void;
}) {
  const monthlyEquivalent =
    plan.duration_days && plan.duration_days > 31
      ? (plan.price_usd / (plan.duration_days / 30)).toFixed(0)
      : null;

  const durationLabel =
    plan.duration_days === null
      ? "Acceso vitalicio"
      : plan.duration_days <= 31
      ? "1 mes"
      : plan.duration_days <= 95
      ? "3 meses"
      : plan.duration_days <= 185
      ? "6 meses"
      : "1 año";

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      onClick={onSelect}
      className={`relative rounded-3xl p-8 flex flex-col gap-6 cursor-pointer border transition-all ${
        highlighted
          ? "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400 text-white shadow-xl shadow-pink-200"
          : "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-pink-300"
      }`}
    >
      {highlighted && (
        <>
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-white/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Sparkles size={10} /> Más popular
            </span>
          </div>
        </>
      )}

      <div>
        <p className={`text-xs font-black uppercase tracking-widest mb-2 ${highlighted ? "text-pink-100" : "text-pink-500"}`}>
          {durationLabel}
        </p>
        <h3 className={`text-2xl font-black ${highlighted ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
        {plan.sublabel && (
          <p className={`text-sm font-medium mt-1 ${highlighted ? "text-pink-100" : "text-slate-500"}`}>
            {plan.sublabel}
          </p>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className={`text-5xl font-black ${highlighted ? "text-white" : "text-slate-900"}`}>
          ${plan.price_usd}
        </span>
        <span className={`text-sm font-semibold mb-2 ${highlighted ? "text-pink-100" : "text-slate-400"}`}>
          USD
        </span>
      </div>

      {monthlyEquivalent && (
        <p className={`text-xs font-bold -mt-4 ${highlighted ? "text-pink-100" : "text-slate-400"}`}>
          ≈ ${monthlyEquivalent} USD / mes
        </p>
      )}

      <ul className="flex flex-col gap-3">
        {[
          "Acceso completo a todos los cursos",
          "Lives semanales con expertos",
          "Muro comunitario",
          "Sistema de logros y niveles",
          "Módulo de negocio y emprendimiento",
        ].map((feat) => (
          <li key={feat} className="flex items-start gap-2.5 text-sm font-semibold">
            <Check
              size={15}
              className={`flex-shrink-0 mt-0.5 ${highlighted ? "text-white" : "text-pink-500"}`}
            />
            <span className={highlighted ? "text-white" : "text-slate-700"}>{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
          highlighted
            ? "bg-white text-pink-600 hover:bg-pink-50 shadow-lg"
            : "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100"
        }`}
      >
        Empezar con este plan
      </button>
    </motion.div>
  );
}

// ─── Product Preview Mock ──────────────────────────────────────────────────────
function ProductPreview() {
  const [activeTab, setActiveTab] = useState<"muro" | "cursos" | "lives">("muro");
  const tabs = [
    { id: "muro" as const, label: "Muro", icon: <MessageCircle size={14} /> },
    { id: "cursos" as const, label: "Cursos", icon: <BookOpen size={14} /> },
    { id: "lives" as const, label: "Lives", icon: <Video size={14} /> },
  ];

  return (
    <div className="relative rounded-[2rem] overflow-hidden border border-slate-200 bg-white shadow-xl">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="ml-3 flex-1 bg-white border border-slate-200 rounded-lg h-6 flex items-center px-3">
          <span className="text-slate-400 text-[10px] font-mono">clubdenice.com/muro</span>
        </div>
      </div>

      {/* App nav tabs */}
      <div className="flex items-center gap-1 px-5 pt-4 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? "bg-pink-50 text-pink-600 border border-pink-200 shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content preview */}
      <AnimatePresence mode="wait">
        {activeTab === "muro" && (
          <motion.div
            key="muro"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 flex flex-col gap-3"
          >
            {[
              { avatar: avatarFeat1, name: "María G.", text: "¡Acabo de terminar mis primeros macarons de frambuesa! 🍓 Gracias a la técnica del live de hoy...", likes: 47, time: "hace 2h" },
              { avatar: avatarAuth1, name: "Carolina R.", text: "Compartiéndoles mi torta de fondant de esta semana. Estoy obsesionada con las flores de azúcar 🌸", likes: 83, time: "hace 4h" },
              { avatar: avatarFeat2, name: "Laura M.", text: "¡Primer pedido de encargo completado! 🎂 Esta comunidad me dio el empujón que necesitaba para empezar.", likes: 124, time: "hace 6h" },
            ].map((post, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex gap-3 shadow-sm">
                <img src={post.avatar} alt={post.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-pink-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-900 font-bold text-xs">{post.name}</span>
                    <span className="text-slate-400 text-[10px]">{post.time}</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed line-clamp-2">{post.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-pink-500 text-[10px] font-bold">
                      <Heart size={10} className="fill-pink-500" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-slate-400 hover:text-slate-600 cursor-pointer text-[10px]">
                      <MessageCircle size={10} /> Comentar
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "cursos" && (
          <motion.div
            key="cursos"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 grid grid-cols-2 gap-3"
          >
            {[
              { emoji: "🥐", title: "Croissants artesanales", progress: 65, lessons: 12 },
              { emoji: "🎂", title: "Pasteles de fondant", progress: 100, lessons: 8 },
              { emoji: "🍫", title: "Bombones y trufas", progress: 20, lessons: 15 },
              { emoji: "🥧", title: "Tartas francesas", progress: 0, lessons: 10 },
            ].map((course, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
                <div className="text-2xl mb-2">{course.emoji}</div>
                <p className="text-slate-900 font-bold text-xs mb-1 leading-tight">{course.title}</p>
                <p className="text-slate-500 text-[10px] mb-2">{course.lessons} lecciones</p>
                <div className="w-full bg-slate-100 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-pink-400 to-rose-400"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="text-slate-400 text-[10px] mt-1">{course.progress}% completado</p>
              </div>
            ))}
          </motion.div>
        )}
        {activeTab === "lives" && (
          <motion.div
            key="lives"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 flex flex-col gap-3"
          >
            <div className="bg-pink-50 border border-pink-200 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
              <div className="w-8 h-8 rounded-xl bg-pink-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest mb-0.5">EN VIVO AHORA</p>
                <p className="text-slate-900 font-bold text-xs">Decoración con manga pastelera avanzada</p>
                <p className="text-slate-500 text-[10px]">con Chef Nicola • 347 viendo</p>
              </div>
            </div>
            {[
              { day: "Mié 14", title: "Técnicas de isomalt y caramelo artístico", host: "Chef Valentina" },
              { day: "Vie 16", title: "Negocio: Fijación de precios en repostería", host: "Nice González" },
              { day: "Lun 19", title: "Macarons de lavanda y tonka", host: "Chef Carlos" },
            ].map((live, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-slate-500 text-center leading-tight">{live.day}</span>
                </div>
                <div>
                  <p className="text-slate-900 font-bold text-xs leading-tight">{live.title}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5">{live.host}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing({ onViewChange }: LandingProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });

  // Fetch plans
  useEffect(() => {
    apiFetch<Plan[]>("/api/plans/")
      .then(({ data }) => {
        setPlans(data.filter((p) => p.is_active).sort((a, b) => a.sort_order - b.sort_order));
      })
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  // Close mobile menu on resize
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const faqItems = [
    {
      question: "¿Qué incluye exactamente la membresía?",
      answer: "Obtienes acceso completo a todos los cursos en video bajo demanda (más de 30 cursos), participación en los lives semanales con chefs expertos, acceso al muro comunitario, el sistema de logros y niveles, y el módulo de negocio y emprendimiento. Todo en un solo lugar.",
    },
    {
      question: "¿Puedo cancelar en cualquier momento?",
      answer: "Sí. Tu membresía es por el período que elijas (1, 3 o 6 meses). Al terminar el período simplemente no se renueva automáticamente — no hay cargos sorpresa. Puedes renovar cuando quieras.",
    },
    {
      question: "¿Qué pasa si no soy experta en repostería?",
      answer: "¡Perfecto! La comunidad está diseñada para todos los niveles. Tenemos cursos que van desde lo más básico hasta técnicas avanzadas. El 40% de nuestros miembros son principiantes o intermedios que llegaron sin experiencia previa.",
    },
    {
      question: "¿Cómo funciona el pago?",
      answer: "Aceptamos múltiples métodos de pago (transferencia, Zelle, Binance, entre otros). Una vez que realizas tu pago y envías el comprobante, un administrador verifica y activa tu cuenta. El proceso suele tomar menos de 24 horas.",
    },
    {
      question: "¿Puedo ver los cursos desde mi celular?",
      answer: "Sí, la plataforma es 100% responsive y funciona perfectamente desde cualquier dispositivo: celular, tablet o computadora. Los videos están optimizados para todo tipo de conexión.",
    },
    {
      question: "¿Los lives quedan grabados?",
      answer: "Sí. Si no puedes ver el live en vivo, la grabación queda disponible en la plataforma para que la veas cuando quieras. Nada se pierde.",
    },
  ];

  const highlightedPlanIndex = plans.length === 1 ? 0 : plans.findIndex((p) =>
    p.duration_days !== null && p.duration_days >= 85 && p.duration_days <= 100
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            background: "radial-gradient(ellipse 80% 50% at 20% -20%, rgba(244,114,182,0.15) 0%, transparent 70%)",
          }}
          className="absolute inset-0"
        />
        <div
          style={{
            background: "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(244,114,182,0.10) 0%, transparent 70%)",
          }}
          className="absolute inset-0"
        />
      </div>

      {/* ── Hero Section Wrapper (Includes Nav and Hero) ── */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-start border-b border-slate-200">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          <iframe
            src="https://player.vimeo.com/video/1217664323?background=1&autoplay=1&loop=1&byline=0&title=0&muted=1"
            className="absolute top-1/2 left-1/2 w-[100vw] h-[56.25vw] min-h-screen min-w-[177.77vh] -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            allow="autoplay; fullscreen"
          ></iframe>
          {/* Overlay to lighten video and blend it at the bottom */}
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 to-transparent" />
        </div>

        {/* ── Navigation ───────────────────────────────────────────────── */}
        <nav className="relative w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between z-50">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <img src={logo} alt="El Club de Nice" className="w-9 h-9 object-contain" />
            <span className="font-black text-lg text-slate-900 tracking-tight">
              El Club de Nice
            </span>
          </motion.div>

          {/* Desktop Nav */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="hidden md:flex items-center gap-8"
          >
            <a href="#beneficios" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Beneficios
            </a>
            <a href="#preview" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              La plataforma
            </a>
            <a href="#planes" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Planes
            </a>
            <a href="#testimonios" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors">
              Testimonios
            </a>
            <button
              onClick={() => onViewChange("login")}
              className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors"
            >
              Iniciar Sesión
            </button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange("register")}
              className="px-6 py-2.5 text-sm font-black text-white bg-pink-500 hover:bg-pink-600 rounded-xl shadow-lg shadow-pink-200"
            >
              Únete Ahora
            </motion.button>
          </motion.div>

          {/* Mobile Nav Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onViewChange("login")}
              className="px-3 py-2 text-sm font-bold text-slate-700 border border-slate-200 rounded-xl bg-white/50 backdrop-blur-md"
            >
              Entrar
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white/50 backdrop-blur-md"
            >
              <motion.span
                animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 6 : 0 }}
                className="block w-5 h-0.5 bg-slate-800 origin-center"
              />
              <motion.span
                animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
                className="block w-5 h-0.5 bg-slate-800"
              />
              <motion.span
                animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -6 : 0 }}
                className="block w-5 h-0.5 bg-slate-800 origin-center"
              />
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="relative w-full z-40 md:hidden border-b border-slate-200 bg-white/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="flex flex-col px-6 py-4 gap-1">
                {[
                  { href: "#beneficios", label: "Beneficios" },
                  { href: "#preview", label: "La plataforma" },
                  { href: "#planes", label: "Planes y precios" },
                  { href: "#testimonios", label: "Testimonios" },
                  { href: "#faq", label: "Preguntas frecuentes" },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-3 text-sm font-semibold text-slate-600 hover:text-slate-900 border-b border-slate-100 last:border-none transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { onViewChange("register"); setMobileMenuOpen(false); }}
                  className="mt-3 w-full py-3.5 text-sm font-black text-white bg-pink-500 rounded-2xl"
                >
                  Únete Ahora
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Hero Content ───────────────────────────────────────────── */}
        <section className="relative z-10 max-w-7xl w-full mx-auto px-6 flex-1 flex flex-col justify-center text-center pb-20 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >


            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tight max-w-5xl mx-auto">
              Eleva tu arte{" "}
              <span
                className="text-pink-500"
              >
                dulce
              </span>{" "}
              al siguiente nivel
            </h1>

            <p className="text-lg md:text-xl lg:text-2xl text-slate-600 font-medium max-w-3xl mx-auto mb-10 leading-relaxed">
              Aprende repostería y pastelería con los mejores instructores, conecta con
              una comunidad apasionada y transforma tu hobby en un negocio exitoso.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange("register")}
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 font-black text-white text-lg rounded-2xl shadow-xl shadow-pink-200 bg-pink-500 hover:bg-pink-600 transition-colors"
              >
                Quiero ser miembro <ArrowRight size={20} />
              </motion.button>
              <button
                onClick={() => onViewChange("login")}
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 font-bold text-slate-700 text-base rounded-2xl border border-slate-300 bg-white/60 backdrop-blur-md hover:bg-white/90 transition-all shadow-sm"
              >
                Ya tengo cuenta <ChevronRight size={16} />
              </button>
            </div>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap items-center justify-center gap-6 mt-4 text-slate-500"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <ShieldCheck size={18} className="text-green-500" />
              <span>Acceso seguro</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Lock size={18} className="text-blue-500" />
              <span>Contenido exclusivo</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Heart size={18} className="text-pink-400" />
              <span>Comunidad activa</span>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 border-y border-slate-200 py-16 bg-white/50">
        <div className="relative max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
          {[
            { value: 500, suffix: "+", label: "Miembros activos" },
            { value: 30, suffix: "+", label: "Cursos de repostería" },
            { value: 100, suffix: "+", label: "Lives realizados" },
            { value: 95, suffix: "%", label: "Satisfacción" },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={statsInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              <p
                className="text-4xl md:text-5xl font-black text-pink-500"
              >
                {statsInView ? (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Features Bento Grid ───────────────────────────────────────── */}
      <section
        id="beneficios"
        ref={featuresRef}
        className="relative z-10 max-w-7xl mx-auto px-6 py-12"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-8"
        >
          <p className="text-pink-500 font-bold uppercase tracking-widest text-xs mb-4">
            ¿Por qué El Club de Nice?
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
            Todo lo que necesitas para{" "}
            <span className="text-pink-500">
              crecer
            </span>
          </h2>
          <p className="text-slate-600 font-medium max-w-xl mx-auto">
            Desde técnicas básicas hasta negocios de pastelería — todo en un solo lugar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={featuresInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-12 gap-5"
        >
          <div className="md:col-span-7">
            <FeatureCard
              large
              accent
              icon={<Video size={24} />}
              title="Lives semanales con expertos"
              description="Cada semana, los mejores pasteleros de España y Latinoamérica te enseñan sus técnicas en vivo. Haz preguntas en tiempo real y aprende al ritmo de los profesionales."
            />
          </div>

          <div className="md:col-span-5">
            <FeatureCard
              large
              icon={<BookOpen size={24} />}
              title="Cursos en video bajo demanda"
              description="Accede a más de 30 cursos estructurados paso a paso: macarons, pasteles de fondant, postres franceses, panadería artesanal y mucho más."
            />
          </div>

          <div className="md:col-span-4">
            <FeatureCard
              icon={<MessageCircle size={24} />}
              title="Muro comunitario"
              description="Comparte tus creaciones, recibe feedback y celebra los logros de tu comunidad de repostería en tiempo real."
            />
          </div>

          <div className="md:col-span-4">
            <FeatureCard
              icon={<Award size={24} />}
              title="Sistema de logros y niveles"
              description="Gana XP por cada interacción, sube de nivel y desbloquea badges exclusivos que muestran tu dedicación al arte dulce."
            />
          </div>

          <div className="md:col-span-4">
            <FeatureCard
              icon={<TrendingUp size={24} />}
              title="De hobby a negocio"
              description="Aprende no solo técnicas sino también precios, branding y ventas. Convierte tu pasión en una fuente de ingresos real."
            />
          </div>
        </motion.div>
      </section>

      {/* ── Product Preview ───────────────────────────────────────────── */}


      {/* ── For Whom ─────────────────────────────────────────────────── */}
      <section id="para-quien" className="relative z-10 py-12">
        <div
          style={{
            background: "linear-gradient(180deg, transparent, rgba(219,39,119,0.05) 50%, transparent)",
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
              ¿Esto es para ti?
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900">
              Hecho para quienes aman{" "}
              <span className="text-pink-500">
                hornear
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                emoji: "🎂",
                title: "Principiantes con pasión",
                description:
                  "Nunca has hecho un macaron perfecto? No importa. Aquí empezamos desde cero con paciencia y metodología probada. Tu primer pastel de bodas está más cerca de lo que crees.",
                items: ["Bases sólidas de repostería", "Cursos introductorios", "Comunidad que te apoya"],
              },
              {
                emoji: "🍰",
                title: "Reposteros intermedios",
                description:
                  "Ya dominas lo básico pero quieres elevar tu técnica. Los lives y cursos avanzados te darán ese salto de calidad que tus clientes van a notar inmediatamente.",
                items: ["Técnicas avanzadas en video", "Feedback de expertos", "Logros que miden tu progreso"],
              },
              {
                emoji: "🏪",
                title: "Profesionales y emprendedores",
                description:
                  "Tienes talento y quieres monetizarlo. Aprende fijación de precios, marketing digital para pastelerías y cómo construir una marca dulce que perdure.",
                items: ["Estrategias de negocio", "Red de contactos", "Visibilidad en la comunidad"],
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
                whileHover={{ y: -6 }}
                className="relative bg-white border border-slate-200 shadow-sm rounded-3xl p-8 overflow-hidden group hover:shadow-md transition-shadow"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(244,114,182,0.1), transparent)" }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{card.emoji}</div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{card.title}</h3>
                  <p className="text-slate-600 text-sm font-medium leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <ul className="space-y-2">
                    {card.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-400 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Sobre Mí / Historia ─────────────────────────────────────── */}
      <section id="sobre-mi" className="relative z-10 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[3rem] overflow-hidden border border-slate-200 bg-white p-8 md:p-16 shadow-xl">
            {/* Glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[120px] opacity-20"
              style={{ background: "#db2777" }} />
            <div className="absolute -bottom-24 -right-12 w-60 h-60 rounded-full blur-[100px] opacity-15"
              style={{ background: "#f472b6" }} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              
              {/* Imagen de perfil grande */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
                className="flex justify-center"
              >
                <div className="relative">
                  <img
                    src={nicePerfil}
                    alt="Nice de perfil"
                    className="w-full max-w-md rounded-[2rem] object-cover shadow-2xl border-4 border-white"
                  />
                  <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-4">
                    <div className="bg-pink-100 p-3 rounded-xl">
                      <Star className="text-pink-500 fill-pink-500" size={24} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-black text-lg">10+ Años</p>
                      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">de experiencia</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Texto / Historia */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
                  Sobre Mí
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 leading-tight">
                  Hola, soy{" "}
                  <span className="text-pink-500">
                    Nice
                  </span>
                </h2>
                <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                  <p>
                    Mi historia en la repostería comenzó como un pequeño sueño en mi cocina, 
                    horneando para familiares y amigos. Con el tiempo, esta pasión se transformó 
                    en una vocación que me llevó a convertir el azúcar y la harina en mi estilo de vida.
                  </p>
                  <p>
                    Hoy, mi mayor satisfacción es ver cómo mis alumnas logran texturas perfectas, 
                    sabores inolvidables y transforman este dulce pasatiempo en un negocio 
                    exitoso y rentable. ¡Te invito a ser parte de esta historia!
                  </p>
                </div>
                
                <div className="mt-8 flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onViewChange("register")}
                    className="px-6 py-3 font-bold text-white bg-pink-500 rounded-xl shadow-lg shadow-pink-200 hover:bg-pink-600 transition-colors"
                  >
                    Aprende conmigo
                  </motion.button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery / Member Work ─────────────────────────────────────── */}
      <section className="relative z-10 py-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center">
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-3">
            Trabajos de nuestra comunidad
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900">
            Lo que crean nuestras{" "}
            <span className="text-pink-500">
              miembros
            </span>
          </h2>
        </div>

        {/* Infinite scroll gallery */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-r from-slate-50 to-transparent" />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none bg-gradient-to-l from-slate-50 to-transparent" />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 w-max"
          >
            {[
              { emoji: "🎂", bg: "from-pink-50 to-rose-100", label: "Torta de bodas" },
              { emoji: "🥐", bg: "from-amber-50 to-yellow-100", label: "Croissants de mantequilla" },
              { emoji: "🍫", bg: "from-purple-50 to-indigo-100", label: "Bombones artesanales" },
              { emoji: "🌸", bg: "from-pink-50 to-fuchsia-100", label: "Flores de azúcar" },
              { emoji: "🥧", bg: "from-blue-50 to-cyan-100", label: "Tarta de limón" },
              { emoji: "🍰", bg: "from-emerald-50 to-teal-100", label: "Layer cake de vainilla" },
              { emoji: "🧁", bg: "from-violet-50 to-purple-100", label: "Cupcakes decorados" },
              { emoji: "🎂", bg: "from-pink-50 to-rose-100", label: "Torta de bodas" },
              { emoji: "🥐", bg: "from-amber-50 to-yellow-100", label: "Croissants de mantequilla" },
              { emoji: "🍫", bg: "from-purple-50 to-indigo-100", label: "Bombones artesanales" },
              { emoji: "🌸", bg: "from-pink-50 to-fuchsia-100", label: "Flores de azúcar" },
              { emoji: "🥧", bg: "from-blue-50 to-cyan-100", label: "Tarta de limón" },
              { emoji: "🍰", bg: "from-emerald-50 to-teal-100", label: "Layer cake de vainilla" },
              { emoji: "🧁", bg: "from-violet-50 to-purple-100", label: "Cupcakes decorados" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-44 h-44 rounded-3xl bg-gradient-to-br ${item.bg} border border-pink-100 flex flex-col items-center justify-center gap-2 shadow-sm`}
              >
                <span className="text-5xl">{item.emoji}</span>
                <span className="text-xs font-bold text-slate-700 text-center px-3 leading-tight">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <p className="text-slate-500 text-sm font-medium">
            Sube tu propia creación al muro y recibe feedback de la comunidad ✨
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section id="testimonios" className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
            Lo que dice nuestra comunidad
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            Historias reales,{" "}
            <span className="text-pink-500">
              resultados reales
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <TestimonialCard
            avatar={avatarFeat1}
            name="María González"
            role="Pastelera freelance · Venezuela"
            text="Gracias al Club de Nice pude aprender técnicas que nunca encontré en YouTube. En 3 meses ya tenía mis primeros 5 clientes y hoy vivo de la repostería. No lo hubiera logrado sin esta comunidad."
            delay={0}
          />
          <TestimonialCard
            avatar={avatarAuth1}
            name="Carolina Ramírez"
            role="Dueña de pastelería · Colombia"
            text="Los lives semanales son increíbles. Cada semana aprendo algo nuevo que puedo aplicar inmediatamente en mi negocio. La calidad del contenido es muy superior a lo que esperaba."
            delay={0.1}
          />
          <TestimonialCard
            avatar={avatarFeat2}
            name="Laura Méndez"
            role="Repostera artesanal · México"
            text="El sistema de niveles me tiene enganchada. Cada día me desafío a crear algo nuevo, compartirlo en el muro y recibir feedback real. La comunidad es súper amorosa y motivadora."
            delay={0.2}
          />

        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="planes" className="relative z-10 py-12">
        <div
          style={{ background: "linear-gradient(180deg, transparent, rgba(219,39,119,0.07) 50%, transparent)" }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
              Elige tu plan
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">
              Invierte en tu{" "}
              <span className="text-pink-500">
                pasión
              </span>
            </h2>
            <p className="text-slate-600 font-medium max-w-xl mx-auto">
              Sin renovaciones automáticas. Sin sorpresas. Elige el plan que mejor se adapte a tu ritmo.
            </p>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-96 rounded-3xl bg-slate-50 border border-slate-100 animate-pulse shadow-sm" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            // Fallback static plans if API fails
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Mensual", price: 10, duration: "1 mes", highlighted: false },
                { name: "Semestral", price: 40, duration: "6 meses", highlighted: true },
                { name: "Anual", price: 60, duration: "1 año", highlighted: false },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  onClick={() => onViewChange("register")}
                  className={`relative rounded-3xl p-8 flex flex-col gap-6 cursor-pointer border transition-all ${
                    p.highlighted
                      ? "bg-gradient-to-br from-pink-500 to-rose-500 border-pink-400 text-white shadow-xl shadow-pink-200"
                      : "bg-white border-slate-200 text-slate-900 shadow-sm hover:border-pink-300"
                  }`}
                >
                  {p.highlighted && (
                    <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
                        <Sparkles size={10} /> Más popular
                      </span>
                    </div>
                  )}
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${p.highlighted ? "text-pink-100" : "text-pink-500"}`}>{p.duration}</p>
                    <h3 className={`text-2xl font-black ${p.highlighted ? "text-white" : "text-slate-900"}`}>{p.name}</h3>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={`text-5xl font-black ${p.highlighted ? "text-white" : "text-slate-900"}`}>${p.price}</span>
                    <span className={`text-sm font-semibold mb-2 ${p.highlighted ? "text-pink-100" : "text-slate-500"}`}>USD</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {["Todos los cursos", "Lives semanales", "Muro comunitario", "Sistema de logros", "Módulo negocio"].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-semibold">
                        <Check size={15} className={`flex-shrink-0 ${p.highlighted ? "text-white" : "text-pink-500"}`} />
                        <span className={p.highlighted ? "text-white" : "text-slate-600"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onViewChange("register")}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                      p.highlighted
                        ? "bg-white text-pink-600 hover:bg-pink-50 shadow-xl"
                        : "bg-pink-50 text-pink-600 border border-pink-200 hover:bg-pink-100 shadow-sm"
                    }`}
                  >
                    Empezar con este plan
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className={`grid grid-cols-1 gap-6 ${plans.length === 2 ? "md:grid-cols-2 max-w-3xl mx-auto" : plans.length >= 3 ? "md:grid-cols-3" : "max-w-sm mx-auto"}`}>
              {plans.map((plan, i) => (
                <motion.div
                  key={plan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                >
                  <PlanCard
                    plan={plan}
                    highlighted={i === (highlightedPlanIndex >= 0 ? highlightedPlanIndex : Math.floor(plans.length / 2))}
                    onSelect={() => onViewChange("register")}
                  />
                </motion.div>
              ))}
            </div>
          )}


        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-14">
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
            Preguntas frecuentes
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900">
            Todo lo que{" "}
            <span className="text-pink-500">
              necesitas saber
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, i) => (
            <FaqItem key={i} question={item.question} answer={item.answer} index={i} />
          ))}
        </div>


      </section>



      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="El Club de Nice" className="w-8 h-8 object-contain" />
              <span className="font-black text-lg text-slate-900 tracking-tight">
                El Club de Nice
              </span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-6">
              {[
                { href: "#beneficios", label: "Beneficios" },
                { href: "#preview", label: "La plataforma" },
                { href: "#planes", label: "Planes" },
                { href: "#testimonios", label: "Testimonios" },
                { href: "#faq", label: "FAQ" },
              ].map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-semibold text-slate-500 hover:text-pink-500 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-pink-500 hover:border-pink-200 transition-all"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-200 transition-all"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-slate-200 bg-white shadow-sm flex items-center justify-center text-slate-400 hover:text-slate-900 hover:border-slate-300 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm font-medium text-center">
              © {new Date().getFullYear()} El Club de Nice · Comunidad de Repostería y Pastelería
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
                Términos y condiciones
              </a>
              <a href="#" className="text-slate-400 text-xs font-medium hover:text-slate-600 transition-colors">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
