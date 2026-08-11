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
          ? "bg-gradient-to-br from-pink-600 to-rose-700 border-pink-500/50 text-white"
          : "bg-white/5 border-white/10 text-white backdrop-blur-sm"
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
          accent ? "bg-white/20" : "bg-pink-500/20"
        }`}
      >
        <div className={accent ? "text-white" : "text-pink-400"}>{icon}</div>
      </div>
      <div className="relative z-10">
        <h3
          className={`font-black text-xl mb-2 ${
            accent ? "text-white" : "text-white"
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-sm font-medium leading-relaxed ${
            accent ? "text-pink-100" : "text-white/50"
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
      className="bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-7 flex flex-col gap-5"
    >
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} size={14} className="text-pink-400 fill-pink-400" />
        ))}
      </div>
      <p className="text-white/70 text-sm font-medium leading-relaxed flex-1">
        &ldquo;{text}&rdquo;
      </p>
      <div className="flex items-center gap-3">
        <img
          src={avatar}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border-2 border-pink-500/30"
        />
        <div>
          <p className="text-white font-bold text-sm">{name}</p>
          <p className="text-white/40 text-xs font-medium">{role}</p>
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
      className="border border-white/10 rounded-2xl overflow-hidden backdrop-blur-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-7 py-5 text-left gap-4 hover:bg-white/5 transition-colors"
      >
        <span className="font-bold text-white text-sm md:text-base leading-snug">{question}</span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.25 }} className="flex-shrink-0">
          <ChevronDown size={18} className="text-pink-400" />
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
            <p className="px-7 pb-6 text-sm text-white/55 font-medium leading-relaxed">{answer}</p>
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
          ? "bg-gradient-to-br from-pink-600 to-rose-700 border-pink-400/60 shadow-2xl shadow-pink-900/40"
          : "bg-white/5 border-white/10 backdrop-blur-sm hover:border-white/20"
      }`}
    >
      {highlighted && (
        <>
          <div className="absolute -top-20 -right-20 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-4 right-4">
            <span className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full">
              <Sparkles size={10} /> Más popular
            </span>
          </div>
        </>
      )}

      <div>
        <p className={`text-xs font-black uppercase tracking-widest mb-2 ${highlighted ? "text-pink-100" : "text-pink-400"}`}>
          {durationLabel}
        </p>
        <h3 className="text-2xl font-black text-white">{plan.name}</h3>
        {plan.sublabel && (
          <p className={`text-sm font-medium mt-1 ${highlighted ? "text-pink-100" : "text-white/50"}`}>
            {plan.sublabel}
          </p>
        )}
      </div>

      <div className="flex items-end gap-1">
        <span className={`text-5xl font-black ${highlighted ? "text-white" : "text-white"}`}>
          ${plan.price_usd}
        </span>
        <span className={`text-sm font-semibold mb-2 ${highlighted ? "text-pink-100" : "text-white/40"}`}>
          USD
        </span>
      </div>

      {monthlyEquivalent && (
        <p className={`text-xs font-bold -mt-4 ${highlighted ? "text-pink-100" : "text-white/40"}`}>
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
              className={`flex-shrink-0 mt-0.5 ${highlighted ? "text-white" : "text-pink-400"}`}
            />
            <span className={highlighted ? "text-white" : "text-white/70"}>{feat}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
          highlighted
            ? "bg-white text-pink-600 hover:bg-pink-50 shadow-xl"
            : "bg-pink-600/20 text-pink-300 border border-pink-500/30 hover:bg-pink-600/30"
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
    <div className="relative rounded-[2rem] overflow-hidden border border-white/10 bg-[#0e0a12] shadow-2xl">
      {/* Fake browser chrome */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/8 bg-white/4">
        <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
        <div className="ml-3 flex-1 bg-white/8 rounded-lg h-6 flex items-center px-3">
          <span className="text-white/30 text-[10px] font-mono">clubdenice.com/muro</span>
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
                ? "bg-pink-600/20 text-pink-300 border border-pink-500/30"
                : "text-white/40 hover:text-white/60"
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
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex gap-3">
                <img src={post.avatar} alt={post.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-pink-500/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-xs">{post.name}</span>
                    <span className="text-white/30 text-[10px]">{post.time}</span>
                  </div>
                  <p className="text-white/60 text-xs leading-relaxed line-clamp-2">{post.text}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-pink-400 text-[10px] font-bold">
                      <Heart size={10} className="fill-pink-400" /> {post.likes}
                    </span>
                    <span className="flex items-center gap-1 text-white/30 text-[10px]">
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
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <div className="text-2xl mb-2">{course.emoji}</div>
                <p className="text-white font-bold text-xs mb-1 leading-tight">{course.title}</p>
                <p className="text-white/30 text-[10px] mb-2">{course.lessons} lecciones</p>
                <div className="w-full bg-white/10 rounded-full h-1">
                  <div
                    className="h-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                    style={{ width: `${course.progress}%` }}
                  />
                </div>
                <p className="text-white/40 text-[10px] mt-1">{course.progress}% completado</p>
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
            <div className="bg-pink-600/15 border border-pink-500/30 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
              </div>
              <div>
                <p className="text-[10px] font-black text-pink-400 uppercase tracking-widest mb-0.5">EN VIVO AHORA</p>
                <p className="text-white font-bold text-xs">Decoración con manga pastelera avanzada</p>
                <p className="text-white/40 text-[10px]">con Chef Nicola • 347 viendo</p>
              </div>
            </div>
            {[
              { day: "Mié 14", title: "Técnicas de isomalt y caramelo artístico", host: "Chef Valentina" },
              { day: "Vie 16", title: "Negocio: Fijación de precios en repostería", host: "Nice González" },
              { day: "Lun 19", title: "Macarons de lavanda y tonka", host: "Chef Carlos" },
            ].map((live, i) => (
              <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] font-black text-white/50 text-center leading-tight">{live.day}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-xs leading-tight">{live.title}</p>
                  <p className="text-white/40 text-[10px] mt-0.5">{live.host}</p>
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
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
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
    <div
      style={{ background: "linear-gradient(135deg, #0a0a0f 0%, #100a14 50%, #0d0a0a 100%)" }}
      className="min-h-screen text-white overflow-x-hidden"
    >
      {/* Ambient Glow Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            background: "radial-gradient(ellipse 80% 50% at 20% -20%, rgba(219,39,119,0.18) 0%, transparent 70%)",
          }}
          className="absolute inset-0"
        />
        <div
          style={{
            background: "radial-gradient(ellipse 60% 40% at 80% 100%, rgba(219,39,119,0.10) 0%, transparent 70%)",
          }}
          className="absolute inset-0"
        />
      </div>

      {/* ── Navigation ───────────────────────────────────────────────── */}
      <nav className="relative z-50 max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <img src={logo} alt="El Club de Nice" className="w-9 h-9 object-contain" />
          <span className="font-black text-lg text-white tracking-tight">
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
          <a href="#beneficios" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Beneficios
          </a>
          <a href="#preview" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            La plataforma
          </a>
          <a href="#planes" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Planes
          </a>
          <a href="#testimonios" className="text-sm font-semibold text-white/60 hover:text-white transition-colors">
            Testimonios
          </a>
          <button
            onClick={() => onViewChange("login")}
            className="text-sm font-bold text-white/80 hover:text-white transition-colors"
          >
            Iniciar Sesión
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange("register")}
            style={{ background: "linear-gradient(135deg, #db2777, #9d174d)" }}
            className="px-6 py-2.5 text-sm font-black text-white rounded-xl shadow-lg shadow-pink-900/40"
          >
            Únete Ahora
          </motion.button>
        </motion.div>

        {/* Mobile Nav Toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => onViewChange("login")}
            className="px-3 py-2 text-sm font-bold text-white/70 border border-white/10 rounded-xl"
          >
            Entrar
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 rounded-xl border border-white/10"
          >
            <motion.span
              animate={{ rotate: mobileMenuOpen ? 45 : 0, y: mobileMenuOpen ? 6 : 0 }}
              className="block w-5 h-0.5 bg-white origin-center"
            />
            <motion.span
              animate={{ opacity: mobileMenuOpen ? 0 : 1 }}
              className="block w-5 h-0.5 bg-white"
            />
            <motion.span
              animate={{ rotate: mobileMenuOpen ? -45 : 0, y: mobileMenuOpen ? -6 : 0 }}
              className="block w-5 h-0.5 bg-white origin-center"
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
            className="relative z-40 md:hidden border-b border-white/8 bg-black/60 backdrop-blur-xl overflow-hidden"
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
                  className="py-3 text-sm font-semibold text-white/70 hover:text-white border-b border-white/5 last:border-none transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={() => { onViewChange("register"); setMobileMenuOpen(false); }}
                style={{ background: "linear-gradient(135deg, #db2777, #9d174d)" }}
                className="mt-3 w-full py-3.5 text-sm font-black text-white rounded-2xl"
              >
                Únete Ahora
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 mb-8">
            <Sparkles size={14} className="text-pink-400" />
            <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">
              La comunidad #1 de repostería en Latam
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-[1.05] tracking-tight max-w-5xl mx-auto">
            Eleva tu arte{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #db2777, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              dulce
            </span>{" "}
            al siguiente nivel
          </h1>

          <p className="text-lg md:text-xl text-white/60 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Aprende repostería y pastelería con los mejores instructores, conecta con
            una comunidad apasionada y transforma tu hobby en un negocio exitoso.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onViewChange("register")}
              style={{ background: "linear-gradient(135deg, #db2777, #9d174d)" }}
              className="flex items-center gap-3 px-8 py-4 font-black text-white text-lg rounded-2xl shadow-xl shadow-pink-900/50"
            >
              Quiero ser miembro <ArrowRight size={20} />
            </motion.button>
            <button
              onClick={() => onViewChange("login")}
              className="flex items-center gap-2 px-8 py-4 font-bold text-white/70 text-base rounded-2xl border border-white/10 hover:border-white/20 hover:text-white transition-all"
            >
              Ya tengo cuenta <ChevronRight size={16} />
            </button>
          </div>
        </motion.div>

        {/* VSL */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative max-w-4xl mx-auto"
        >
          <div
            style={{
              background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(219,39,119,0.3) 0%, transparent 70%)",
            }}
            className="absolute -inset-4 -bottom-10 rounded-[3rem] blur-2xl"
          />
          <div
            id="vsl"
            className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl aspect-video bg-black/60 flex items-center justify-center"
          >
            {isVideoPlaying ? (
              <iframe
                src="https://drive.google.com/file/d/1T1yZBvP8u9bIHQOMCQMe6YCh92BgCYJY/preview"
                className="absolute inset-0 w-full h-full border-0"
                allow="autoplay"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src="https://drive.google.com/thumbnail?id=1T1yZBvP8u9bIHQOMCQMe6YCh92BgCYJY&sz=w1200-h675"
                  alt="Conoce El Club de Nice"
                  className="absolute inset-0 w-full h-full object-cover opacity-50"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setIsVideoPlaying(true)}
                  className="relative z-10 flex flex-col items-center gap-3 cursor-pointer"
                >
                  <div className="relative w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl">
                    <Play className="text-pink-600 fill-pink-600 ml-1" size={32} />
                    <div className="absolute inset-0 rounded-full bg-white/30 animate-ping" />
                  </div>
                  <span className="text-white font-bold text-sm bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                    Ver video presentación
                  </span>
                </motion.button>
              </>
            )}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="flex flex-wrap items-center justify-center gap-6 mt-10 text-white/40"
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck size={16} className="text-green-400" />
            <span>Acceso seguro</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Lock size={16} className="text-blue-400" />
            <span>Contenido exclusivo</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Heart size={16} className="text-pink-400" />
            <span>Comunidad activa</span>
          </div>
        </motion.div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="relative z-10 border-y border-white/5 py-16">
        <div
          style={{
            background: "linear-gradient(90deg, transparent, rgba(219,39,119,0.05), transparent)",
          }}
          className="absolute inset-0"
        />
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
                style={{
                  background: "linear-gradient(135deg, #db2777, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
                className="text-4xl md:text-5xl font-black"
              >
                {statsInView ? (
                  <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                ) : (
                  `0${stat.suffix}`
                )}
              </p>
              <p className="text-xs font-bold text-white/40 uppercase tracking-widest mt-2">
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
        className="relative z-10 max-w-7xl mx-auto px-6 py-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={featuresInView ? { opacity: 1, y: 0 } : {}}
          className="text-center mb-16"
        >
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
            ¿Por qué El Club de Nice?
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
            Todo lo que necesitas para{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #db2777, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              crecer
            </span>
          </h2>
          <p className="text-white/50 font-medium max-w-xl mx-auto">
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
      <section id="preview" className="relative z-10 py-24">
        <div
          style={{ background: "linear-gradient(180deg, transparent, rgba(219,39,119,0.06) 50%, transparent)" }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
                La plataforma
              </p>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                Diseñada para{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #db2777, #f472b6)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  inspirarte
                </span>{" "}
                cada día
              </h2>
              <p className="text-white/55 font-medium leading-relaxed mb-10">
                Una experiencia pensada para reposteras. Navega entre el muro de la comunidad,
                tus cursos favoritos y el calendario de lives — todo desde un solo lugar, en cualquier dispositivo.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon: <Palette size={18} className="text-pink-400" />, title: "Interfaz intuitiva y bella", desc: "Diseño premium hecho para inspirar tu creatividad." },
                  { icon: <RefreshCw size={18} className="text-blue-400" />, title: "Siempre actualizado", desc: "Nuevo contenido cada semana: cursos, lives y tips." },
                  { icon: <Calendar size={18} className="text-emerald-400" />, title: "Calendario de lives en vivo", desc: "Nunca te pierdas una clase — recibe recordatorios." },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5 }}
                    className="flex items-start gap-4 bg-white/4 border border-white/8 rounded-2xl p-4"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">{item.title}</p>
                      <p className="text-white/45 text-sm font-medium mt-0.5">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
            >
              <ProductPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── For Whom ─────────────────────────────────────────────────── */}
      <section id="para-quien" className="relative z-10 py-24">
        <div
          style={{
            background: "linear-gradient(180deg, transparent, rgba(219,39,119,0.05) 50%, transparent)",
          }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
              ¿Esto es para ti?
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white">
              Hecho para quienes aman{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #db2777, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
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
                className="relative bg-white/5 border border-white/10 backdrop-blur-sm rounded-3xl p-8 overflow-hidden group"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(219,39,119,0.08), transparent)" }}
                />
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{card.emoji}</div>
                  <h3 className="text-xl font-black text-white mb-3">{card.title}</h3>
                  <p className="text-white/50 text-sm font-medium leading-relaxed mb-6">
                    {card.description}
                  </p>
                  <ul className="space-y-2">
                    {card.items.map((item, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm font-semibold text-white/70">
                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500 flex-shrink-0" />
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

      {/* ── Instructor / Quién soy ─────────────────────────────────── */}
      <section id="quien-es-nice" className="relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative rounded-[3rem] overflow-hidden border border-white/8 p-10 md:p-16"
            style={{ background: "linear-gradient(135deg, #130a18 0%, #1c0d22 100%)" }}
          >
            {/* Glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full blur-[120px] opacity-20"
              style={{ background: "#db2777" }} />
            <div className="absolute -bottom-24 -right-12 w-60 h-60 rounded-full blur-[100px] opacity-15"
              style={{ background: "#f472b6" }} />

            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
              >
                <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
                  Tu instructora
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  Hola, soy{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #db2777, #f472b6)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Nice
                  </span>{" "}
                  👋
                </h2>
                <p className="text-white/65 font-medium leading-relaxed mb-6">
                  Soy pastelera y emprendedora con más de 10 años transformando ingredientes simples
                  en obras de arte comestibles. Fundé El Club de Nice porque quise crear el espacio
                  que yo necesitaba cuando empecé: una comunidad donde aprender, crecer y construir
                  un negocio real con mi pasión.
                </p>
                <p className="text-white/65 font-medium leading-relaxed mb-10">
                  Hoy más de 500 reposteras en toda Latinoamérica son parte de esta familia. Y tú
                  puedes ser la próxima.
                </p>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { value: "10+", label: "Años de experiencia" },
                    { value: "500+", label: "Alumnas formadas" },
                    { value: "100+", label: "Lives impartidos" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-white/5 border border-white/8 rounded-2xl p-4 text-center">
                      <p className="text-2xl font-black text-pink-400">{stat.value}</p>
                      <p className="text-xs font-bold text-white/40 mt-1 leading-tight">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.7 }}
                className="flex flex-col gap-4"
              >
                {/* Avatar + name card */}
                <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex items-center gap-5">
                  <div className="relative">
                    <img
                      src={avatarAuth4}
                      alt="Nice González"
                      className="w-20 h-20 rounded-2xl object-cover border-2 border-pink-500/40"
                    />
                    <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-pink-500 rounded-lg flex items-center justify-center">
                      <BadgeCheck size={14} className="text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-black text-lg">Nice González</p>
                    <p className="text-white/50 text-sm font-medium">Fundadora · Chef Pastelera</p>
                    <div className="flex items-center gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-pink-400 fill-pink-400" />
                      ))}
                      <span className="text-white/40 text-xs ml-1">5.0 · 500+ alumnas</span>
                    </div>
                  </div>
                </div>

                {/* Achievements */}
                {[
                  { icon: <Award size={18} className="text-yellow-400" />, text: "Premiada como mejor instructora de repostería online 2023" },
                  { icon: <Users size={18} className="text-blue-400" />, text: "Comunidad de +50k seguidores en Instagram y TikTok" },
                  { icon: <Video size={18} className="text-pink-400" />, text: "Más de 100 lives y clases magistrales impartidas" },
                  { icon: <TrendingUp size={18} className="text-emerald-400" />, text: "El 78% de sus alumnas monetizaron su pasión en 6 meses" },
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="bg-white/4 border border-white/8 rounded-2xl p-4 flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white/8 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <p className="text-white/70 text-sm font-medium leading-snug">{item.text}</p>
                  </motion.div>
                ))}
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
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Lo que crean nuestras{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #db2777, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              miembros
            </span>
          </h2>
        </div>

        {/* Infinite scroll gallery */}
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(90deg, #0a0a0f, transparent)" }} />
          <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none"
            style={{ background: "linear-gradient(-90deg, #0a0a0f, transparent)" }} />
          <motion.div
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-4 w-max"
          >
            {[
              { emoji: "🎂", bg: "from-pink-900/40 to-rose-900/30", label: "Torta de bodas" },
              { emoji: "🥐", bg: "from-amber-900/40 to-yellow-900/30", label: "Croissants de mantequilla" },
              { emoji: "🍫", bg: "from-purple-900/40 to-indigo-900/30", label: "Bombones artesanales" },
              { emoji: "🌸", bg: "from-pink-900/40 to-fuchsia-900/30", label: "Flores de azúcar" },
              { emoji: "🥧", bg: "from-blue-900/40 to-cyan-900/30", label: "Tarta de limón" },
              { emoji: "🍰", bg: "from-emerald-900/40 to-teal-900/30", label: "Layer cake de vainilla" },
              { emoji: "🧁", bg: "from-violet-900/40 to-purple-900/30", label: "Cupcakes decorados" },
              { emoji: "🎂", bg: "from-pink-900/40 to-rose-900/30", label: "Torta de bodas" },
              { emoji: "🥐", bg: "from-amber-900/40 to-yellow-900/30", label: "Croissants de mantequilla" },
              { emoji: "🍫", bg: "from-purple-900/40 to-indigo-900/30", label: "Bombones artesanales" },
              { emoji: "🌸", bg: "from-pink-900/40 to-fuchsia-900/30", label: "Flores de azúcar" },
              { emoji: "🥧", bg: "from-blue-900/40 to-cyan-900/30", label: "Tarta de limón" },
              { emoji: "🍰", bg: "from-emerald-900/40 to-teal-900/30", label: "Layer cake de vainilla" },
              { emoji: "🧁", bg: "from-violet-900/40 to-purple-900/30", label: "Cupcakes decorados" },
            ].map((item, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-44 h-44 rounded-3xl bg-gradient-to-br ${item.bg} border border-white/8 flex flex-col items-center justify-center gap-2`}
              >
                <span className="text-5xl">{item.emoji}</span>
                <span className="text-xs font-bold text-white/50 text-center px-3 leading-tight">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="text-center mt-8">
          <p className="text-white/40 text-sm font-medium">
            Sube tu propia creación al muro y recibe feedback de la comunidad ✨
          </p>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section id="testimonios" className="relative z-10 max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
            Lo que dice nuestra comunidad
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Historias reales,{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #db2777, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
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
          <TestimonialCard
            avatar={avatarAuth2}
            name="Daniela Flores"
            role="Estudiante de gastronomía · Argentina"
            text="Pensé que era cara la membresía pero es lo mejor que he invertido en mi formación. Los cursos en video los puedo ver a mi ritmo y los lives me conectan con profesionales de verdad."
            delay={0.3}
          />
          <TestimonialCard
            avatar={avatarFeat3}
            name="Valentina Torres"
            role="Emprendedora · Perú"
            text="Lo que más me sorprendió fue el módulo de negocio. Aprendí a poner precios correctamente y en el primer mes recuperé 3 veces lo que pagué por la membresía. Totalmente recomendado."
            delay={0.4}
          />
          <TestimonialCard
            avatar={avatarAuth3}
            name="Sofía Martínez"
            role="Pastelera · Chile"
            text="La comunidad del muro es lo que me hace volver cada día. Nunca me sentí sola en mi proceso de aprendizaje. Hay alguien siempre dispuesto a ayudarte y celebrar tus logros."
            delay={0.5}
          />
        </div>
      </section>

      {/* ── Pricing ───────────────────────────────────────────────────── */}
      <section id="planes" className="relative z-10 py-24">
        <div
          style={{ background: "linear-gradient(180deg, transparent, rgba(219,39,119,0.07) 50%, transparent)" }}
          className="absolute inset-0 pointer-events-none"
        />
        <div className="relative max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
              Elige tu plan
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
              Invierte en tu{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, #db2777, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                pasión
              </span>
            </h2>
            <p className="text-white/50 font-medium max-w-xl mx-auto">
              Sin renovaciones automáticas. Sin sorpresas. Elige el plan que mejor se adapte a tu ritmo.
            </p>
          </div>

          {plansLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-96 rounded-3xl bg-white/5 border border-white/8 animate-pulse" />
              ))}
            </div>
          ) : plans.length === 0 ? (
            // Fallback static plans if API fails
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Mensual", price: 25, duration: "1 mes", highlighted: false },
                { name: "Trimestral", price: 60, duration: "3 meses", highlighted: true },
                { name: "Semestral", price: 100, duration: "6 meses", highlighted: false },
              ].map((p, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5 }}
                  whileHover={{ y: -6 }}
                  onClick={() => onViewChange("register")}
                  className={`relative rounded-3xl p-8 flex flex-col gap-6 cursor-pointer border ${
                    p.highlighted
                      ? "bg-gradient-to-br from-pink-600 to-rose-700 border-pink-400/60 shadow-2xl shadow-pink-900/40"
                      : "bg-white/5 border-white/10 backdrop-blur-sm"
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
                    <p className={`text-xs font-black uppercase tracking-widest mb-2 ${p.highlighted ? "text-pink-100" : "text-pink-400"}`}>{p.duration}</p>
                    <h3 className="text-2xl font-black text-white">{p.name}</h3>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-black text-white">${p.price}</span>
                    <span className={`text-sm font-semibold mb-2 ${p.highlighted ? "text-pink-100" : "text-white/40"}`}>USD</span>
                  </div>
                  <ul className="flex flex-col gap-3">
                    {["Todos los cursos", "Lives semanales", "Muro comunitario", "Sistema de logros", "Módulo negocio"].map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm font-semibold">
                        <Check size={15} className={`flex-shrink-0 ${p.highlighted ? "text-white" : "text-pink-400"}`} />
                        <span className={p.highlighted ? "text-white" : "text-white/70"}>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => onViewChange("register")}
                    className={`w-full py-4 rounded-2xl font-black text-sm transition-all ${
                      p.highlighted
                        ? "bg-white text-pink-600 hover:bg-pink-50 shadow-xl"
                        : "bg-pink-600/20 text-pink-300 border border-pink-500/30 hover:bg-pink-600/30"
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

          {/* Guarantee */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 bg-white/4 border border-white/8 rounded-3xl px-8 py-6 max-w-2xl mx-auto"
          >
            <div className="w-14 h-14 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={24} className="text-green-400" />
            </div>
            <div className="text-center sm:text-left">
              <p className="text-white font-black text-base mb-1">Garantía de satisfacción</p>
              <p className="text-white/50 text-sm font-medium leading-relaxed">
                Si en los primeros 7 días sientes que el Club de Nice no es para ti, te devolvemos tu dinero.
                Sin preguntas, sin complicaciones.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-pink-400 font-bold uppercase tracking-widest text-xs mb-4">
            Preguntas frecuentes
          </p>
          <h2 className="text-4xl md:text-5xl font-black text-white">
            Todo lo que{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #db2777, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              necesitas saber
            </span>
          </h2>
        </div>

        <div className="flex flex-col gap-3">
          {faqItems.map((item, i) => (
            <FaqItem key={i} question={item.question} answer={item.answer} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-10 text-center bg-white/4 border border-white/8 rounded-3xl p-8"
        >
          <p className="text-white/60 font-medium mb-4">¿Tienes más dudas? Escríbenos directamente.</p>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-pink-500/30 text-pink-300 font-bold text-sm hover:bg-pink-500/10 transition-colors"
          >
            <Instagram size={16} /> Contáctanos en Instagram
          </a>
        </motion.div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────── */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative rounded-[3rem] overflow-hidden p-16 text-center"
          style={{
            background: "linear-gradient(135deg, #1a0a12 0%, #2d0a1a 50%, #1a0a12 100%)",
            border: "1px solid rgba(219,39,119,0.2)",
          }}
        >
          {/* Glows */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-[100px] opacity-30"
            style={{ background: "#db2777" }}
          />
          <div
            className="absolute -bottom-32 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20"
            style={{ background: "#f472b6" }}
          />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/30 bg-pink-500/10 mb-8">
              <Zap size={14} className="text-pink-400" />
              <span className="text-xs font-bold text-pink-300 uppercase tracking-widest">
                Únete hoy y empieza a crear
              </span>
            </div>

            <h2 className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
              Tu próxima obra maestra{" "}
              <br />
              <span
                style={{
                  background: "linear-gradient(135deg, #db2777, #f472b6)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                empieza aquí
              </span>
            </h2>

            <p className="text-white/60 font-medium mb-10 max-w-xl mx-auto text-lg">
              Únete a cientos de reposteras y pasteleros que ya están transformando
              su pasión en su profesión.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onViewChange("register")}
                style={{ background: "linear-gradient(135deg, #db2777, #9d174d)" }}
                className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-5 font-black text-white text-lg rounded-2xl shadow-2xl shadow-pink-900/50"
              >
                Quiero ser miembro ahora <ArrowRight size={22} />
              </motion.button>
              <button
                onClick={() => onViewChange("login")}
                className="w-full sm:w-auto px-10 py-5 font-bold text-white/70 text-base rounded-2xl border border-white/10 hover:border-white/20 hover:text-white transition-all"
              >
                Ya tengo cuenta
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 mt-10 text-white/30">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <ShieldCheck size={15} className="text-green-400" />
                <span>Garantía 7 días</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Clock size={15} className="text-blue-400" />
                <span>Activación en menos de 24h</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Star size={15} className="text-pink-400 fill-pink-400" />
                <span>Contenido premium</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-14">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
            <div className="flex items-center gap-3">
              <img src={logo} alt="El Club de Nice" className="w-8 h-8 object-contain" />
              <span className="font-black text-lg text-white/90 tracking-tight">
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
                  className="text-sm font-semibold text-white/40 hover:text-white/80 transition-colors"
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
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-pink-400 hover:border-pink-500/40 transition-all"
              >
                <Instagram size={16} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/40 transition-all"
              >
                <Youtube size={16} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/30 transition-all"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm font-medium text-center">
              © {new Date().getFullYear()} El Club de Nice · Comunidad de Repostería y Pastelería
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-white/25 text-xs font-medium hover:text-white/50 transition-colors">
                Términos y condiciones
              </a>
              <a href="#" className="text-white/25 text-xs font-medium hover:text-white/50 transition-colors">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
