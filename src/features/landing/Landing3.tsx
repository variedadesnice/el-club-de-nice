import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import fondo1 from "../../assets/landing oscar/FONDO 1.png";
import fondo2 from "../../assets/landing oscar/FONDO 2.png";
import fondo3 from "../../assets/landing oscar/FONDO 3.png";
import fondo5 from "../../assets/landing oscar/FONDO 5.png";
import logo from "../../assets/logo.png";
import cuadroReproductor from "../../assets/landing oscar/CUADRO REPRODUCTOR.png";
import grupo2 from "../../assets/landing oscar/Grupo 2.png";
import { Paintbrush, RefreshCw, Calendar, Star, Instagram, Youtube, ChevronLeft, ChevronRight } from "lucide-react";
import nicePerfil from "../../assets/contenido/nice de perfil.png";
import avatarFeat1 from "../../assets/avatars/feat1.jpg";
import avatarFeat2 from "../../assets/avatars/feat2.jpg";
import avatarFeat3 from "../../assets/avatars/feat3.jpg";

interface Testimonial {
  name: string;
  role: string;
  country: string;
  image: string;
  quote: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "María González",
    role: "Pastelera freelance",
    country: "Venezuela",
    image: avatarFeat1,
    quote: "Gracias al Club de Nice pude aprender técnicas que nunca encontré en YouTube. En 3 meses ya tenía mis primeros 5 clientes y hoy vivo de la repostería. No lo hubiera logrado sin esta comunidad.",
    rating: 5,
  },
  {
    name: "Carolina Ramírez",
    role: "Dueña de pastelería",
    country: "Colombia",
    image: avatarFeat3,
    quote: "Los lives semanales son increíbles. Cada semana aprendo algo nuevo que puedo aplicar inmediatamente en mi negocio. La calidad del contenido es muy superior a lo que esperaba.",
    rating: 5,
  },
  {
    name: "Laura Méndez",
    role: "Repostera artesanal",
    country: "México",
    image: avatarFeat2,
    quote: "El sistema de niveles me tiene enganchada. Cada día me desafío a crear algo nuevo, compartirlo en el muro y recibir feedback real. La comunidad es súper amorosa y motivadora.",
    rating: 5,
  },
];

function TestimonialCard({ testimonial, index }: { testimonial: Testimonial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.12, ease: "easeOut" }}
      className="flex flex-col justify-between bg-white border border-[#E8E8EE] rounded-[18px] p-5 sm:p-7 h-full w-full max-w-full shadow-[0_4px_16px_rgba(0,0,0,0.02)] hover:-translate-y-1 hover:border-[#ff008c]/40 hover:shadow-[0_14px_35px_rgba(255,0,140,0.07)] transition-all duration-300"
    >
      <div className="w-full">
        {/* Estrellas */}
        <div className="flex items-center gap-1 text-[#ff008c] mb-3 sm:mb-4">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <span key={i} className="text-[15px] sm:text-[16px] leading-none select-none">
              ★
            </span>
          ))}
        </div>

        {/* Cita */}
        <p className="text-[#617089] text-[14px] sm:text-[15px] leading-[1.65] font-[450] mb-5 sm:mb-6 break-words whitespace-normal text-left">
          “{testimonial.quote}”
        </p>
      </div>

      {/* Perfil */}
      <div className="flex items-center gap-3.5 pt-4 border-t border-[#f4f4f7]">
        <img
          src={testimonial.image}
          alt={testimonial.name}
          className="w-[42px] h-[42px] rounded-full object-cover border border-[#f0e4ec] shrink-0"
        />
        <div className="flex flex-col">
          <h4 className="text-[#071631] font-[750] text-[14.5px] leading-tight">
            {testimonial.name}
          </h4>
          <span className="text-[#617089] text-[11.5px] sm:text-[12px] font-[500] mt-0.5 leading-tight">
            {testimonial.role} · {testimonial.country}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

function AnimatedCounter({ target, duration = 1500 }: { target: number, duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let hasAnimated = false;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          hasAnimated = true;
          let startTime: number | null = null;
          
          const step = (timestamp: number) => {
            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            
            // ease out cubic
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            setCount(Math.floor(easeProgress * target));
            
            if (progress < 1) {
              window.requestAnimationFrame(step);
            } else {
              setCount(target);
            }
          };
          
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [target, duration]);

  return <span ref={ref}>{count}</span>;
}

export default function Landing3() {
  const navigate = useNavigate();
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const testimonialCarouselRef = useRef<HTMLDivElement>(null);

  const handleCarouselScroll = () => {
    if (!testimonialCarouselRef.current) return;
    const { scrollLeft, offsetWidth } = testimonialCarouselRef.current;
    if (offsetWidth === 0) return;
    const newIndex = Math.round(scrollLeft / offsetWidth);
    setActiveTestimonial(Math.min(Math.max(newIndex, 0), testimonials.length - 1));
  };

  const scrollToSlide = (idx: number) => {
    if (!testimonialCarouselRef.current) return;
    const containerWidth = testimonialCarouselRef.current.offsetWidth;
    testimonialCarouselRef.current.scrollTo({
      left: idx * containerWidth,
      behavior: "smooth",
    });
    setActiveTestimonial(idx);
  };

  return (
    <div className="w-full flex flex-col font-sans overflow-x-hidden">
      {/* Navbar / Header */}
      <header className="w-full bg-white sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 md:px-12 py-3.5 sm:py-4 shadow-sm">
        {/* Logo and Title */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <img src={logo} alt="El Club de Nice Logo" className="h-7 sm:h-8 w-auto object-contain" />
          <span className="font-[800] text-[#071426] text-lg sm:text-xl tracking-tight">
            El Club de Nice
          </span>
        </div>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-8">
          <a href="#beneficios" className="text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors">
            Beneficios
          </a>
          <a href="#plataforma" className="text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors">
            La plataforma
          </a>
          <a href="#planes" className="text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors">
            Planes
          </a>
          <a href="#testimonios" className="text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors">
            Testimonios
          </a>
        </nav>

        {/* Actions */}
        <div className="flex items-center space-x-3 sm:space-x-6">
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#ff2f92] text-white px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-[13px] sm:text-[14px] font-[700] shadow-[0_4px_14px_0_rgba(255,47,146,0.39)] hover:shadow-[0_6px_20px_rgba(255,47,146,0.23)] hover:bg-[#e0267d] hover:-translate-y-[1px] transition-all"
          >
            Únete Ahora
          </button>
        </div>
      </header>

      {/* Sección 1: Hero */}
      <section
        className="min-h-[460px] sm:min-h-[560px] md:min-h-[calc(100vh-76px)] w-full bg-cover bg-center bg-no-repeat relative flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${fondo1})` }}
      >
        <div className="z-10 flex flex-col items-center justify-center px-4">
          <h1 className="text-3xl sm:text-5xl md:text-7xl text-white font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-center">
            Hero Section
          </h1>
        </div>
      </section>

      {/* Sección Estadísticas */}
      <section className="w-full bg-[#fdfdfd] py-10 sm:py-16 md:py-[90px] px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1250px] mx-auto"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 md:gap-12">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[38px] sm:text-[54px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-2 sm:mb-3 font-sans tracking-tight">
                <AnimatedCounter target={500} />+
              </div>
              <div className="text-[11px] sm:text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.08em] sm:tracking-[0.1em] font-sans">
                Miembros Activos
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[38px] sm:text-[54px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-2 sm:mb-3 font-sans tracking-tight">
                <AnimatedCounter target={30} />+
              </div>
              <div className="text-[11px] sm:text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.08em] sm:tracking-[0.1em] font-sans">
                Cursos de Repostería
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[38px] sm:text-[54px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-2 sm:mb-3 font-sans tracking-tight">
                <AnimatedCounter target={100} />+
              </div>
              <div className="text-[11px] sm:text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.08em] sm:tracking-[0.1em] font-sans">
                Lives Realizados
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[38px] sm:text-[54px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-2 sm:mb-3 font-sans tracking-tight">
                <AnimatedCounter target={95} />%
              </div>
              <div className="text-[11px] sm:text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.08em] sm:tracking-[0.1em] font-sans">
                Satisfacción
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Sección 2: Reproductor (Fondo Eliminado) */}
      <section
        className="w-full relative flex flex-col items-center justify-center py-14 sm:py-20 md:py-28 px-4 sm:px-6 bg-white"
      >
        <div className="z-20 text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="text-[26px] sm:text-4xl md:text-5xl lg:text-[56px] font-[800] text-[#071426] tracking-tight font-sans leading-[1.15]">
            Todo lo que necesitas para <span className="text-[#ff2f92]">crecer</span>
          </h2>
        </div>

        <div className="relative w-full max-w-[1000px] mx-auto flex items-center justify-center group">
          {/* Imagen del marco/cuadro */}
          <img 
            src={cuadroReproductor} 
            alt="Marco Reproductor" 
            className="w-full h-auto relative z-20 pointer-events-none drop-shadow-2xl" 
          />
          
          {/* Contenedor del video centrado. */}
          <div className="absolute z-10 top-[5%] left-[5%] w-[90%] h-[90%] bg-black flex items-center justify-center overflow-hidden rounded-md shadow-inner">
            <video 
              className="w-full h-full object-cover" 
              controls 
              controlsList="nodownload"
            >
              <source src="" type="video/mp4" />
              Tu navegador no soporta reproducción de video.
            </video>
          </div>
        </div>
      </section>

      {/* Sección 3: Pricing (Fondo Eliminado) */}
      <section
        id="planes"
        className="w-full relative flex flex-col items-center justify-center py-16 sm:py-20 md:py-[120px] px-4 sm:px-6 bg-[#071426]"
      >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="z-10 flex flex-col items-center w-full max-w-[860px]"
        >
          {/* Encabezado */}
          <span className="text-[#ff008c] font-[700] text-[12px] sm:text-[13px] md:text-[14px] uppercase tracking-[0.12em] mb-3 sm:mb-[18px]">
            Elige tu plan
          </span>
          <h2 className="text-[30px] sm:text-[40px] md:text-[48px] lg:text-[56px] font-[800] text-white text-center leading-[1.1] tracking-tight mb-4 sm:mb-5">
            Invierte en tu <span className="text-[#ff008c]">pasión</span>
          </h2>
          <p className="text-white/90 text-[14px] sm:text-[16px] md:text-[18px] font-[550] text-center max-w-[620px] leading-[1.5] mb-8 sm:mb-12 md:mb-[80px] px-2">
            Sin renovaciones automáticas. Sin sorpresas. Elige el plan que mejor se adapte a tu ritmo.
          </p>

          {/* Contenedor de Precios */}
          <div className="w-full max-w-[440px] md:max-w-none grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-[28px] mx-auto">
            
            {/* Plan Mensual */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
              className="flex flex-col bg-white rounded-[22px] md:rounded-[26px] p-6 sm:p-7 md:p-[34px] shadow-[0_18px_50px_rgba(0,0,0,0.08)] hover:-translate-y-[5px] transition-transform duration-300 ease-in-out order-2 md:order-1"
            >
              <div className="mb-5 sm:mb-6">
                <span className="text-[#ff008c] font-[700] text-[12px] sm:text-[13px] uppercase tracking-wide">1 Mes</span>
                <h3 className="text-[#071426] font-[750] text-[24px] sm:text-[28px] mt-1 leading-none">Mensual</h3>
                <p className="text-[#8ca0b3] font-[600] text-[14px] sm:text-[15px] mt-[4px]">Acceso mensual</p>
              </div>
              
              <div className="flex items-baseline mb-5 sm:mb-[24px]">
                <span className="text-[#071426] font-[800] text-[40px] sm:text-[48px] md:text-[58px] tracking-[-0.02em] leading-none">$0.0016</span>
                <span className="text-[#8ca0b3] font-[600] text-[13px] sm:text-[14px] ml-2">USD</span>
              </div>

              <ul className="flex-1 space-y-3 sm:space-y-[15px] flex flex-col justify-start">
                {[
                  "Acceso completo a todos los cursos",
                  "Lives semanales con expertos",
                  "Muro comunitario",
                  "Sistema de logros y niveles",
                  "Módulo de negocio y emprendimiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-[#ff008c] font-bold mr-2.5 sm:mr-3 mt-[1px] text-[14px]">✓</span>
                    <span className="text-[#17324a] font-[600] text-[14px] sm:text-[15px] leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-6 sm:mt-[28px] w-full h-[52px] sm:h-[56px] rounded-[16px] bg-[#fff0f7] border border-[#ff008c]/25 text-[#ff008c] font-[700] text-[14.5px] sm:text-[15px] hover:bg-[#ffe5f1] hover:-translate-y-[2px] transition-all duration-300">
                Empezar con este plan
              </button>
            </motion.div>

            {/* Plan Anual (Destacado) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative flex flex-col rounded-[22px] md:rounded-[26px] p-6 sm:p-7 md:p-[34px] shadow-xl hover:shadow-2xl hover:-translate-y-[5px] transition-all duration-300 ease-in-out order-1 md:order-2 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #ff00a0 0%, #ff0088 45%, #ff006e 100%)",
              }}
            >
              {/* Radial gradient sutil */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 85% 5%, rgba(255,255,255,0.12), transparent 35%)" }}></div>

              <div className="relative z-10 flex justify-between items-start mb-5 sm:mb-6">
                <div>
                  <span className="text-white font-[700] text-[12px] sm:text-[13px] uppercase tracking-wide">1 Año</span>
                  <h3 className="text-white font-[750] text-[24px] sm:text-[28px] mt-1 leading-none">Anual</h3>
                  <p className="text-white/90 font-[600] text-[14px] sm:text-[15px] mt-[4px]">Plan anual</p>
                </div>
                <div className="bg-white/20 backdrop-blur-[8px] text-white text-[11px] sm:text-[12px] font-[750] tracking-[0.03em] px-3 sm:px-[14px] py-1.5 sm:py-[8px] rounded-full whitespace-nowrap self-start mt-1">
                  ✣ MÁS POPULAR
                </div>
              </div>

              <div className="relative z-10 mb-5 sm:mb-[22px]">
                <div className="flex items-baseline">
                  <span className="text-white font-[800] text-[40px] sm:text-[48px] md:text-[58px] tracking-[-0.02em] leading-none">$197</span>
                  <span className="text-white/90 font-[650] text-[13px] sm:text-[14px] ml-2">USD</span>
                </div>
                <div className="text-white/90 font-[650] text-[13px] sm:text-[14px] mt-1">
                  ≈ $16 USD / mes
                </div>
              </div>

              <ul className="relative z-10 flex-1 space-y-3 sm:space-y-[15px] flex flex-col justify-start">
                {[
                  "Acceso completo a todos los cursos",
                  "Lives semanales con expertos",
                  "Muro comunitario",
                  "Sistema de logros y niveles",
                  "Módulo de negocio y emprendimiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-white font-bold mr-2.5 sm:mr-3 mt-[1px] text-[14px]">✓</span>
                    <span className="text-white font-[600] text-[14px] sm:text-[15px] leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="relative z-10 mt-6 sm:mt-[28px] w-full h-[52px] sm:h-[56px] rounded-[16px] bg-white text-[#ff008c] font-[750] text-[14.5px] sm:text-[15px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-[2px] transition-all duration-300">
                Empezar con este plan
              </button>
            </motion.div>

          </div>
        </motion.div>
      </section>

      {/* Sección: Hecho para quienes aman hornear */}
      <section id="beneficios" className="w-full relative bg-white py-14 sm:py-20 md:py-[110px] px-4 sm:px-6">
        <div className="max-w-[1240px] mx-auto">
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16"
          >
            <span className="text-[#ff008c] font-[750] text-[11px] sm:text-[12px] md:text-[13px] uppercase tracking-[0.14em] mb-2 sm:mb-3">
              ¿ESTO ES PARA TI?
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[52px] font-[850] text-[#0c1830] tracking-[-0.03em] leading-[1.15]">
              Hecho para quienes aman <span className="text-[#ff008c]">hornear</span>
            </h2>
          </motion.div>

          {/* Tarjetas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                emoji: "🎂",
                title: "Principiantes con pasión",
                description:
                  "Nunca has hecho un macaron perfecto? No importa. Aquí empezamos desde cero con paciencia y metodología probada. Tu primer pastel de bodas está más cerca de lo que crees.",
                items: [
                  "Bases sólidas de repostería",
                  "Cursos introductorios",
                  "Comunidad que te apoya",
                ],
              },
              {
                emoji: "🍰",
                title: "Reposteros intermedios",
                description:
                  "Ya dominas lo básico pero quieres elevar tu técnica. Los lives y cursos avanzados te darán ese salto de calidad que tus clientes van a notar inmediatamente.",
                items: [
                  "Técnicas avanzadas en video",
                  "Feedback de expertos",
                  "Logros que miden tu progreso",
                ],
              },
              {
                emoji: "🏪",
                title: "Profesionales y emprendedores",
                description:
                  "Tienes talento y quieres monetizarlo. Aprende fijación de precios, marketing digital para pastelerías y cómo construir una marca dulce que perdure.",
                items: [
                  "Estrategias de negocio",
                  "Red de contactos",
                  "Visibilidad en la comunidad",
                ],
              },
            ].map((card, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.12, ease: "easeOut" }}
                whileHover={{ y: -6 }}
                className="flex flex-col justify-between rounded-[32px] md:rounded-[36px] p-8 md:p-10 border border-[#fce7f3]/70 shadow-[0_12px_40px_rgba(12,24,48,0.04)] hover:shadow-[0_18px_45px_rgba(255,0,140,0.08)] transition-all duration-300"
                style={{
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #ffffff 52%, #fff5fa 82%, #ffeaf5 100%)",
                }}
              >
                <div>
                  <div className="text-[38px] md:text-[42px] mb-5 select-none leading-none">
                    {card.emoji}
                  </div>
                  <h3 className="text-[#0c1830] font-[800] text-[20px] md:text-[22px] leading-snug mb-3.5">
                    {card.title}
                  </h3>
                  <p className="text-[#5a6f87] font-[450] text-[14px] md:text-[14.5px] leading-[1.65] mb-8">
                    {card.description}
                  </p>
                </div>

                <ul className="space-y-3 pt-2">
                  {card.items.map((item, itemIdx) => (
                    <li
                      key={itemIdx}
                      className="flex items-center text-[#3b4b5e] font-[600] text-[13.5px] md:text-[14px]"
                    >
                      <span className="w-[6px] h-[6px] rounded-full bg-[#ff008c] mr-3 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sección Diseñada para inspirarte cada día */}
      <section
        id="plataforma"
        className="w-full relative flex flex-col justify-center overflow-hidden py-20 md:py-[100px] bg-[#610d29]"
      >
        <div className="relative z-10 w-full max-w-[1240px] mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-[0.9fr_1.1fr] items-center gap-0 md:gap-8">
          
          {/* COLUMNA IZQUIERDA */}
          <div className="flex flex-col relative z-20 w-full">
            
            {/* Textos iniciales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="flex flex-col"
            >
              <span className="text-[#ff2f98] font-[700] text-[12px] md:text-[14px] uppercase tracking-[0.08em] mb-[18px]">
                La plataforma
              </span>
              
              <h2 className="text-[clamp(34px,10vw,43px)] md:text-[clamp(42px,4vw,58px)] font-[800] leading-[1.05] md:leading-[1.08] tracking-[-0.03em] text-white">
                Diseñada para <span className="text-[#ff008c]">inspirarte</span> <br className="hidden md:block" /> cada día
              </h2>
              
              <p className="text-white/92 text-[15px] md:text-[17px] font-[500] leading-[1.65] max-w-[540px] mt-[25px] mb-[15px] md:mb-[34px]">
                Una experiencia pensada para reposteras. Navega entre el muro de la comunidad, tus cursos favoritos y el calendario de lives — todo desde un solo lugar, en cualquier dispositivo.
              </p>
            </motion.div>

            {/* IMAGEN MOBILE (Oculta en Desktop) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden relative z-10 w-full my-6 flex justify-center pointer-events-none overflow-hidden"
            >
              <img 
                src={grupo2} 
                alt="Vista de la plataforma en móvil" 
                className="w-full max-w-[360px] object-contain drop-shadow-xl"
              />
            </motion.div>

            {/* Tarjetas de Beneficios */}
            <div className="flex flex-col gap-[12px] sm:gap-[14px] w-full max-w-full md:max-w-[480px]">
              
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-white rounded-[20px] sm:rounded-[24px] min-h-[64px] md:h-[76px] flex items-center p-[10px] sm:p-[12px] pr-[14px] sm:pr-[16px] gap-[14px] sm:gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-full bg-[#ffecf5] flex items-center justify-center shrink-0 ml-[4px]">
                  <Paintbrush className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#ff008c]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[13.5px] sm:text-[14px] md:text-[15px] leading-[1.2]">Interfaz intuitiva y bella</h4>
                  <p className="text-[#6c88a0] font-[500] text-[12.5px] sm:text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Diseño premium hecho para inspirar tu creatividad.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
                className="bg-white rounded-[20px] sm:rounded-[24px] min-h-[64px] md:h-[76px] flex items-center p-[10px] sm:p-[12px] pr-[14px] sm:pr-[16px] gap-[14px] sm:gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-full bg-[#e6f4ff] flex items-center justify-center shrink-0 ml-[4px]">
                  <RefreshCw className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#008cff]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[13.5px] sm:text-[14px] md:text-[15px] leading-[1.2]">Siempre actualizado</h4>
                  <p className="text-[#6c88a0] font-[500] text-[12.5px] sm:text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Nuevo contenido cada semana: cursos, lives y tips.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
                className="bg-white rounded-[20px] sm:rounded-[24px] min-h-[64px] md:h-[76px] flex items-center p-[10px] sm:p-[12px] pr-[14px] sm:pr-[16px] gap-[14px] sm:gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[42px] h-[42px] sm:w-[46px] sm:h-[46px] rounded-full bg-[#e5fcf2] flex items-center justify-center shrink-0 ml-[4px]">
                  <Calendar className="w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] text-[#00b87a]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[13.5px] sm:text-[14px] md:text-[15px] leading-[1.2]">Calendario de lives en vivo</h4>
                  <p className="text-[#6c88a0] font-[500] text-[12.5px] sm:text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Nunca te pierdas una clase — recibe recordatorios.</p>
                </div>
              </motion.div>
              
            </div>

            {/* Botones */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              className="mt-7 sm:mt-[32px] md:mt-[42px] flex flex-col sm:flex-row gap-3 sm:gap-[16px]"
            >
              <button 
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto h-[50px] sm:h-[54px] md:h-[58px] px-6 sm:px-[32px] rounded-[18px] sm:rounded-[20px] text-white font-[700] text-[14.5px] sm:text-[15px] md:text-[16px] flex justify-center items-center hover:-translate-y-[2px] transition-all duration-300"
                style={{
                  backgroundColor: "#ff008c",
                  boxShadow: "0 4px 15px rgba(255,0,140,0.15)"
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = "0 8px 24px rgba(255,0,140,0.25)"}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = "0 4px 15px rgba(255,0,140,0.15)"}
              >
                Quiero ser miembro &nbsp;&rarr;
              </button>
              <button 
                onClick={() => navigate("/login")}
                className="w-full sm:w-auto h-[50px] sm:h-[54px] md:h-[58px] px-6 sm:px-[32px] rounded-[18px] sm:rounded-[20px] bg-[#fcf1e8] text-[#0c1830] font-[650] text-[14.5px] sm:text-[15px] md:text-[16px] flex justify-center items-center hover:bg-[#faebd9] hover:-translate-y-[2px] transition-all duration-300"
              >
                Ya tengo cuenta &nbsp;&rsaquo;
              </button>
            </motion.div>

          </div>

          {/* COLUMNA DERECHA (IMAGEN DESKTOP - Oculta en mobile) */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.97 }}
            whileInView={{ opacity: 1, x: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex relative z-10 w-full justify-end items-center pointer-events-none"
          >
            <img 
              src={grupo2} 
              alt="Vista de la plataforma" 
              className="w-[125%] max-w-none -translate-x-[6%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.15)]"
            />
          </motion.div>

        </div>
      </section>

      {/* ── SECCIÓN 1 — SOBRE MÍ / HOLA, SOY NICE ── */}
      <section id="sobre-mi" className="w-full relative bg-white pt-16 sm:pt-24 md:pt-[110px] pb-12 sm:pb-14 md:pb-20 px-4 sm:px-6">
        <div className="max-w-[1220px] mx-auto">
          <div className="relative rounded-[28px] sm:rounded-[36px] md:rounded-[40px] bg-white border border-[#E7EAF0] p-5 sm:p-10 md:p-14 lg:p-16 shadow-[0_20px_60px_rgba(12,24,48,0.05)] overflow-hidden">
            
            {/* Forma decorativa orgánica en esquina superior derecha */}
            <div
              className="absolute -top-16 -right-16 w-56 h-56 sm:w-72 sm:h-72 rounded-full pointer-events-none opacity-40 blur-[36px]"
              style={{
                background: "radial-gradient(circle, #ff008c 0%, #ff80bf 45%, transparent 75%)",
              }}
            />
            <div
              className="absolute -top-10 -right-8 w-44 h-44 rounded-full pointer-events-none opacity-20"
              style={{
                background: "linear-gradient(135deg, #ff008c, #ff3399)",
                filter: "blur(24px)",
              }}
            />

            {/* Contenedor: 2 columnas en desktop, orden narrativo específico en mobile */}
            <div className="relative z-10 flex flex-col md:grid md:grid-cols-[0.48fr_0.52fr] gap-6 sm:gap-10 md:gap-12 lg:gap-16 items-center">
              
              {/* HEADER MOBILE (Oculto en Desktop): 1. Eyebrow, 2. Título */}
              <div className="md:hidden w-full text-left">
                <span className="text-[#ff008c] font-[750] text-[11px] sm:text-[12px] uppercase tracking-[0.14em] mb-1.5 block">
                  SOBRE MÍ
                </span>
                <h2 className="text-[28px] sm:text-[36px] font-[800] leading-[1.1] tracking-[-0.03em] text-[#071631]">
                  Hola, soy <span className="text-[#ff008c]">Nice</span>
                </h2>
              </div>

              {/* COLUMNA IZQUIERDA: 3. Fotografía con panel vertical y 4. Badge */}
              <motion.div
                initial={{ opacity: 0, x: -25 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="relative w-full max-w-[420px] mx-auto md:max-w-none flex justify-center"
              >
                {/* Panel vertical para la fotografía */}
                <div
                  className="relative w-full rounded-[24px] sm:rounded-[32px] overflow-visible flex items-end justify-center px-3 sm:px-6 pt-5 sm:pt-8 pb-0"
                  style={{
                    background: "linear-gradient(180deg, #ffffff 0%, #fff7fb 55%, #ffeef7 100%)",
                    border: "1px solid rgba(255, 255, 255, 0.95)",
                    boxShadow: "0 10px 30px rgba(255, 0, 140, 0.05)",
                  }}
                >
                  {/* Halo sutil detrás de la fotografía */}
                  <div
                    className="absolute inset-x-6 bottom-6 h-3/4 rounded-full blur-[45px] opacity-25 pointer-events-none"
                    style={{ background: "radial-gradient(circle, #ff008c 0%, transparent 70%)" }}
                  />

                  <img
                    src={nicePerfil}
                    alt="Nicelis Garrido"
                    className="relative z-10 w-full max-h-[380px] sm:max-h-[500px] md:max-h-[560px] object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.08)]"
                  />

                  {/* Badge flotante en esquina inferior derecha */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
                    className="absolute -bottom-3 right-1 sm:-bottom-5 sm:-right-2 max-w-[calc(100%-16px)] z-20 bg-white rounded-[14px] sm:rounded-[16px] py-2 px-3 sm:py-3.5 sm:px-5 shadow-[0_12px_30px_rgba(12,24,48,0.12)] border border-[#fce7f3] flex items-center gap-2.5 sm:gap-3.5 select-none"
                  >
                    <div className="w-[34px] h-[34px] sm:w-[42px] sm:h-[42px] rounded-[10px] sm:rounded-[12px] bg-[#ffeef7] flex items-center justify-center shrink-0">
                      <Star className="w-[16px] h-[16px] sm:w-[20px] sm:h-[20px] text-[#ff008c] fill-[#ff008c]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[#071631] font-[850] text-[15px] sm:text-[18px] leading-tight">
                        10+ Años
                      </span>
                      <span className="text-[#617089] text-[9.5px] sm:text-[11px] font-[750] uppercase tracking-[0.08em] sm:tracking-[0.1em] mt-0.5 leading-tight">
                        DE EXPERIENCIA
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* COLUMNA DERECHA: Contenido y Biografía */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
                className="flex flex-col w-full"
              >
                {/* HEADER DESKTOP (Oculto en Mobile) */}
                <div className="hidden md:block">
                  <span className="text-[#ff008c] font-[750] text-[12px] md:text-[13px] uppercase tracking-[0.14em] mb-3 block">
                    SOBRE MÍ
                  </span>
                  <h2 className="text-[clamp(42px,4vw,58px)] font-[800] leading-[1.08] tracking-[-0.03em] text-[#071631] mb-6">
                    Hola, soy <span className="text-[#ff008c]">Nice</span>
                  </h2>
                </div>

                {/* 5. Textos con separación vertical */}
                <div className="space-y-3.5 sm:space-y-4 max-w-[580px] text-[#617089] text-[14px] sm:text-[15.5px] md:text-[16.5px] font-[450] leading-[1.68] mb-6 sm:mb-8">
                  <p>
                    Mi historia en la repostería comenzó como un pequeño sueño en mi cocina, horneando para familiares y amigos. Con el tiempo, esa pasión se transformó en una vocación que me llevó a estudiar, perfeccionar mis técnicas y, finalmente, convertir el azúcar y la harina en mi estilo de vida.
                  </p>
                  <p>
                    A lo largo de los años, me di cuenta de que el verdadero arte no solo está en hacer pasteles hermosos, sino en compartir ese conocimiento con otros. Así nació la idea de crear este espacio: un lugar donde cualquiera, sin importar su nivel de experiencia, pueda aprender los secretos de la pastelería.
                  </p>
                  <p>
                    Hoy, mi mayor satisfacción es ver cómo mis alumnos logran texturas perfectas, sabores inolvidables y, sobre todo, cómo muchos transforman este dulce pasatiempo en un negocio exitoso y rentable. ¡Te invito a ser parte de esta historia!
                  </p>
                </div>

                {/* 6. Botón CTA */}
                <div>
                  <motion.button
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/register")}
                    className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-[28px] py-3.5 sm:py-[14px] rounded-[12px] text-white font-[700] text-[14.5px] sm:text-[16px] transition-all duration-300"
                    style={{
                      backgroundColor: "#ff008c",
                      boxShadow: "0 8px 25px rgba(255,0,140,0.22)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#e6007e";
                      e.currentTarget.style.boxShadow = "0 12px 30px rgba(255,0,140,0.35)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#ff008c";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(255,0,140,0.22)";
                    }}
                  >
                    Aprende conmigo &nbsp;&rarr;
                  </motion.button>
                </div>
              </motion.div>

            </div>
          </div>
        </div>
      </section>

      {/* ── SECCIÓN 2 — TESTIMONIOS ── */}
      <section id="testimonios" className="w-full relative bg-white pt-14 sm:pt-20 md:pt-24 pb-20 sm:pb-28 md:pb-32 px-4 sm:px-6">
        <div className="max-w-[1220px] mx-auto">
          
          {/* Encabezado */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16"
          >
            <span className="text-[#ff008c] font-[750] text-[11px] md:text-[13px] uppercase tracking-[0.14em] mb-2 sm:mb-3">
              LO QUE DICE NUESTRA COMUNIDAD
            </span>
            <h2 className="text-[28px] sm:text-[38px] md:text-[clamp(38px,4vw,52px)] font-[800] text-[#071631] tracking-[-0.03em] leading-[1.15]">
              Historias reales, <span className="text-[#ff008c]">resultados reales</span>
            </h2>
          </motion.div>

          {/* Grid Desktop: 3 columnas, gap 20px, max-w 1140px */}
          <div className="hidden md:grid md:grid-cols-3 gap-5 lg:gap-6 max-w-[1140px] mx-auto items-stretch">
            {testimonials.map((t, idx) => (
              <TestimonialCard key={idx} testimonial={t} index={idx} />
            ))}
          </div>

          {/* Carrusel Mobile: Cada tarjeta a ancho completo (sin cortes de texto) */}
          <div className="md:hidden w-full max-w-[460px] mx-auto">
            <div
              ref={testimonialCarouselRef}
              onScroll={handleCarouselScroll}
              className="flex overflow-x-auto snap-x snap-mandatory w-full pb-2 no-scrollbar"
              style={{ scrollbarWidth: "none" }}
            >
              {testimonials.map((t, idx) => (
                <div key={idx} className="w-full min-w-full shrink-0 snap-center px-1">
                  <TestimonialCard testimonial={t} index={idx} />
                </div>
              ))}
            </div>

            {/* Controles de navegación de testimonios */}
            <div className="flex items-center justify-between px-2 mt-5">
              <span className="text-[12px] font-[600] text-[#617089]">
                {activeTestimonial + 1} de {testimonials.length} testimonios
              </span>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => scrollToSlide((activeTestimonial - 1 + testimonials.length) % testimonials.length)}
                  className="w-9 h-9 rounded-full border border-[#E8E8EE] bg-white flex items-center justify-center text-[#071631] hover:text-[#ff008c] hover:border-[#ff008c]/40 active:scale-95 transition-all shadow-sm"
                  aria-label="Testimonio anterior"
                >
                  <ChevronLeft size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                  {testimonials.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => scrollToSlide(idx)}
                      aria-label={`Ir a testimonio ${idx + 1}`}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        activeTestimonial === idx ? "w-7 bg-[#ff008c]" : "w-2.5 bg-[#e2e8f0]"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => scrollToSlide((activeTestimonial + 1) % testimonials.length)}
                  className="w-9 h-9 rounded-full border border-[#E8E8EE] bg-white flex items-center justify-center text-[#071631] hover:text-[#ff008c] hover:border-[#ff008c]/40 active:scale-95 transition-all shadow-sm"
                  aria-label="Siguiente testimonio"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="w-full relative bg-white pb-14 px-4 sm:px-6">
        <div className="max-w-[1220px] mx-auto">
          {/* Gran contenedor horizontal morado oscuro / vinotinto profundo */}
          <div
            className="rounded-[28px] sm:rounded-[36px] md:rounded-[40px] p-6 sm:p-8 md:p-10 lg:px-12 lg:py-9 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 shadow-2xl"
            style={{
              background: "linear-gradient(135deg, #2a0515 0%, #3e0720 50%, #200310 100%)",
              border: "1px solid rgba(255, 0, 140, 0.15)",
            }}
          >
            {/* Izquierda: Logo El Club de Nice */}
            <div className="flex items-center gap-3.5">
              <img src={logo} alt="El Club de Nice" className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow" />
              <span className="font-[800] text-[18px] sm:text-[20px] text-white tracking-tight">
                El Club de Nice
              </span>
            </div>

            {/* Centro: Navegación horizontal */}
            <nav className="flex flex-wrap items-center justify-center gap-5 sm:gap-7 md:gap-8">
              {[
                { label: "Beneficios", href: "#beneficios" },
                { label: "Planes", href: "#planes" },
                { label: "Testimonios", href: "#testimonios" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  className="text-[13.5px] sm:text-[14px] font-[600] text-white/80 hover:text-white transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Derecha: Botones cuadrados blancos con Instagram, YouTube, TikTok */}
            <div className="flex items-center gap-3">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-[#2a0515] hover:bg-[#ffeef7] hover:text-[#ff008c] hover:-translate-y-0.5 shadow-sm transition-all"
                aria-label="Instagram"
              >
                <Instagram size={18} strokeWidth={2.2} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-[#2a0515] hover:bg-[#ffeef7] hover:text-[#ff008c] hover:-translate-y-0.5 shadow-sm transition-all"
                aria-label="YouTube"
              >
                <Youtube size={18} strokeWidth={2.2} />
              </a>
              <a
                href="https://tiktok.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-[12px] bg-white flex items-center justify-center text-[#2a0515] hover:bg-[#ffeef7] hover:text-[#ff008c] hover:-translate-y-0.5 shadow-sm transition-all"
                aria-label="TikTok"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-[17px] h-[17px]">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.76a4.85 4.85 0 01-1.01-.07z" />
                </svg>
              </a>
            </div>
          </div>

          {/* Debajo del contenedor principal */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left px-2">
            <p className="text-[#617089] text-[13px] sm:text-[13.5px] font-[500]">
              © 2026 El Club de Nice · Comunidad de Repostería y Pastelería
            </p>
            <div className="flex items-center gap-6 text-[12.5px] sm:text-[13px] font-[500] text-[#617089]">
              <a href="#" className="hover:text-[#ff008c] transition-colors">
                Términos y condiciones
              </a>
              <a href="#" className="hover:text-[#ff008c] transition-colors">
                Política de privacidad
              </a>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
