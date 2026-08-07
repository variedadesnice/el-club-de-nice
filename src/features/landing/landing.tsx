import { useState, useEffect, useRef } from "react";
import { motion, useInView, useMotionValue, useSpring } from "motion/react";
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
} from "lucide-react";
import logo from "../../assets/logo.png";
import avatarFeat1 from "../../assets/avatars/feat1.jpg";
import avatarFeat2 from "../../assets/avatars/feat2.jpg";
import avatarFeat3 from "../../assets/avatars/feat3.jpg";
import avatarAuth1 from "../../assets/avatars/auth1.jpg";
import avatarAuth2 from "../../assets/avatars/auth2.jpg";
import avatarAuth3 from "../../assets/avatars/auth3.jpg";

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
        "{text}"
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

// ─── Main Landing ──────────────────────────────────────────────────────────────
export default function Landing({ onViewChange }: LandingProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const statsRef = useRef(null);
  const featuresRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const featuresInView = useInView(featuresRef, { once: true });

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
          <a
            href="#beneficios"
            className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            Beneficios
          </a>
          <a
            href="#para-quien"
            className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            ¿Para quién?
          </a>
          <a
            href="#testimonios"
            className="text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
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
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => onViewChange("login")}
            className="px-4 py-2 text-sm font-bold text-white/70 border border-white/10 rounded-xl"
          >
            Entrar
          </button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onViewChange("register")}
            style={{ background: "linear-gradient(135deg, #db2777, #9d174d)" }}
            className="px-4 py-2 text-sm font-black text-white rounded-xl"
          >
            Únete
          </motion.button>
        </div>
      </nav>

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
                    <Play
                      className="text-pink-600 fill-pink-600 ml-1"
                      size={32}
                    />
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
          {/* Main large cell */}
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
                Plazas limitadas — únete hoy
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
                <span>Pago seguro</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold">
                <Users size={15} className="text-blue-400" />
                <span>Comunidad activa</span>
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
      <footer className="relative z-10 border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="El Club de Nice" className="w-8 h-8 object-contain" />
            <span className="font-black text-lg text-white/90 tracking-tight">
              El Club de Nice
            </span>
          </div>

          <p className="text-white/30 text-sm font-medium text-center">
            © {new Date().getFullYear()} El Club de Nice · Comunidad de Repostería y Pastelería
          </p>

          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-sm font-bold text-white/40 hover:text-pink-400 transition-colors"
            >
              Instagram
            </a>
            <a
              href="#"
              className="text-sm font-bold text-white/40 hover:text-pink-400 transition-colors"
            >
              YouTube
            </a>
            <a
              href="#"
              className="text-sm font-bold text-white/40 hover:text-pink-400 transition-colors"
            >
              TikTok
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
