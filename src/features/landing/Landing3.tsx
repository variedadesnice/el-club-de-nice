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
import { Paintbrush, RefreshCw, Calendar } from "lucide-react";

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

  return (
    <div className="w-full flex flex-col font-sans">
      {/* Navbar / Header */}
      <header className="w-full bg-white sticky top-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 shadow-sm">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
          <img src={logo} alt="El Club de Nice Logo" className="h-8 w-auto object-contain" />
          <span className="font-[800] text-[#071426] text-xl tracking-tight hidden sm:block">
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
        <div className="flex items-center space-x-6">
          <button
            onClick={() => navigate("/login")}
            className="hidden md:block text-[14px] font-[700] text-[#46566c] hover:text-[#ff2f92] transition-colors"
          >
            Iniciar Sesión
          </button>
          <button
            onClick={() => navigate("/register")}
            className="bg-[#ff2f92] text-white px-6 py-2.5 rounded-full text-[14px] font-[700] shadow-[0_4px_14px_0_rgba(255,47,146,0.39)] hover:shadow-[0_6px_20px_rgba(255,47,146,0.23)] hover:bg-[#e0267d] hover:-translate-y-[1px] transition-all"
          >
            Únete Ahora
          </button>
        </div>
      </header>

      {/* Sección 1: Hero */}
      <section
        className="min-h-[calc(100vh-76px)] w-full bg-cover bg-center bg-no-repeat relative flex flex-col items-center justify-center"
        style={{ backgroundImage: `url(${fondo1})` }}
      >
        <div className="z-10 flex flex-col items-center justify-center px-4">
          <h1 className="text-5xl md:text-7xl text-white font-bold drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] text-center">
            Hero Section
          </h1>
        </div>
      </section>

      {/* Sección Estadísticas */}
      <section className="w-full bg-[#fdfdfd] py-[70px] md:py-[90px] px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-[1250px] mx-auto"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12">
            
            {/* Stat 1 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[64px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-3 font-sans tracking-tight">
                <AnimatedCounter target={500} />+
              </div>
              <div className="text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.1em] font-sans">
                Miembros Activos
              </div>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[64px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-3 font-sans tracking-tight">
                <AnimatedCounter target={30} />+
              </div>
              <div className="text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.1em] font-sans">
                Cursos de Repostería
              </div>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[64px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-3 font-sans tracking-tight">
                <AnimatedCounter target={100} />+
              </div>
              <div className="text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.1em] font-sans">
                Lives Realizados
              </div>
            </div>

            {/* Stat 4 */}
            <div className="flex flex-col items-center justify-center text-center">
              <div className="text-[64px] md:text-[72px] font-[800] text-[#ff2f92] leading-none mb-3 font-sans tracking-tight">
                <AnimatedCounter target={95} />%
              </div>
              <div className="text-[14px] md:text-[16px] font-[600] text-[#8ca0b3] uppercase tracking-[0.1em] font-sans">
                Satisfacción
              </div>
            </div>

          </div>
        </motion.div>
      </section>

      {/* Sección 2: Reproductor (Fondo Eliminado) */}
      <section
        className="min-h-screen w-full relative flex flex-col items-center justify-center py-20 px-4 bg-white"
      >
        <div className="z-20 text-center mb-12 lg:mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-[800] text-[#071426] tracking-tight font-sans">
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
          
          {/* Contenedor del video centrado. 
              Los porcentajes (top, left, w, h) se ajustan para encajar 
              dentro de la parte transparente/pantalla del cuadro. */}
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
        className="w-full relative flex flex-col items-center justify-center py-24 md:py-[120px] px-4 sm:px-6 bg-[#071426]"
      >
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="z-10 flex flex-col items-center w-full max-w-[860px]"
        >
          {/* Encabezado */}
          <span className="text-[#ff008c] font-[700] text-[13px] md:text-[14px] uppercase tracking-[0.12em] mb-[18px]">
            Elige tu plan
          </span>
          <h2 className="text-[40px] md:text-[48px] lg:text-[56px] font-[800] text-white text-center leading-[1.05] tracking-tight mb-5">
            Invierte en tu <span className="text-[#ff008c]">pasión</span>
          </h2>
          <p className="text-white/90 text-[16px] md:text-[18px] font-[600] text-center max-w-[620px] leading-[1.45] mb-[65px] md:mb-[80px]">
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
              className="flex flex-col bg-white rounded-[22px] md:rounded-[26px] p-[28px] md:p-[34px] shadow-[0_18px_50px_rgba(0,0,0,0.08)] hover:-translate-y-[5px] transition-transform duration-300 ease-in-out order-2 md:order-1"
            >
              <div className="mb-6">
                <span className="text-[#ff008c] font-[700] text-[13px] uppercase tracking-wide">1 Mes</span>
                <h3 className="text-[#071426] font-[750] text-[28px] mt-1 leading-none">Mensual</h3>
                <p className="text-[#8ca0b3] font-[600] text-[15px] mt-[5px]">Acceso mensual</p>
              </div>
              
              <div className="flex items-baseline mb-[24px]">
                <span className="text-[#071426] font-[800] text-[48px] md:text-[58px] tracking-[-0.02em] leading-none">$0.0016</span>
                <span className="text-[#8ca0b3] font-[600] text-[14px] ml-2">USD</span>
              </div>

              <ul className="flex-1 space-y-[15px] flex flex-col justify-start">
                {[
                  "Acceso completo a todos los cursos",
                  "Lives semanales con expertos",
                  "Muro comunitario",
                  "Sistema de logros y niveles",
                  "Módulo de negocio y emprendimiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-[#ff008c] font-bold mr-3 mt-[2px] text-[14px]">✓</span>
                    <span className="text-[#17324a] font-[600] text-[15px] leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="mt-[28px] w-full h-[56px] rounded-[16px] bg-[#fff0f7] border border-[#ff008c]/25 text-[#ff008c] font-[700] text-[15px] hover:bg-[#ffe5f1] hover:-translate-y-[2px] transition-all duration-300">
                Empezar con este plan
              </button>
            </motion.div>

            {/* Plan Anual (Destacado) */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
              className="relative flex flex-col rounded-[22px] md:rounded-[26px] p-[28px] md:p-[34px] shadow-xl hover:shadow-2xl hover:-translate-y-[5px] transition-all duration-300 ease-in-out order-1 md:order-2 overflow-hidden"
              style={{
                background: "linear-gradient(145deg, #ff00a0 0%, #ff0088 45%, #ff006e 100%)",
              }}
            >
              {/* Radial gradient sutil */}
              <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(circle at 85% 5%, rgba(255,255,255,0.12), transparent 35%)" }}></div>

              <div className="relative z-10 flex justify-between items-start mb-6">
                <div>
                  <span className="text-white font-[700] text-[13px] uppercase tracking-wide">1 Año</span>
                  <h3 className="text-white font-[750] text-[28px] mt-1 leading-none">Anual</h3>
                  <p className="text-white/90 font-[600] text-[15px] mt-[5px]">Plan anual</p>
                </div>
                <div className="bg-white/20 backdrop-blur-[8px] text-white text-[12px] font-[750] tracking-[0.03em] px-[14px] py-[8px] rounded-full whitespace-nowrap self-start mt-1">
                  ✣ MÁS POPULAR
                </div>
              </div>

              <div className="relative z-10 mb-[22px]">
                <div className="flex items-baseline">
                  <span className="text-white font-[800] text-[48px] md:text-[58px] tracking-[-0.02em] leading-none">$197</span>
                  <span className="text-white/90 font-[650] text-[14px] ml-2">USD</span>
                </div>
                <div className="text-white/90 font-[650] text-[13px] md:text-[14px] mt-1">
                  ≈ $16 USD / mes
                </div>
              </div>

              <ul className="relative z-10 flex-1 space-y-[15px] flex flex-col justify-start">
                {[
                  "Acceso completo a todos los cursos",
                  "Lives semanales con expertos",
                  "Muro comunitario",
                  "Sistema de logros y niveles",
                  "Módulo de negocio y emprendimiento"
                ].map((item, i) => (
                  <li key={i} className="flex items-start">
                    <span className="text-white font-bold mr-3 mt-[2px] text-[14px]">✓</span>
                    <span className="text-white font-[600] text-[15px] leading-tight">{item}</span>
                  </li>
                ))}
              </ul>

              <button className="relative z-10 mt-[28px] w-full h-[56px] rounded-[16px] bg-white text-[#ff008c] font-[750] text-[15px] hover:shadow-[0_8px_25px_rgba(0,0,0,0.15)] hover:-translate-y-[2px] transition-all duration-300">
                Empezar con este plan
              </button>
            </motion.div>

          </div>
        </motion.div>
      </section>


      {/* Sección Diseñada para inspirarte cada día */}
      <section
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
              className="md:hidden relative z-10 w-full my-6 pointer-events-none"
            >
              <img 
                src={grupo2} 
                alt="Vista de la plataforma en móvil" 
                className="w-[120%] max-w-none ml-[50%] -translate-x-[50%] object-contain"
              />
            </motion.div>

            {/* Tarjetas de Beneficios */}
            <div className="flex flex-col gap-[14px] w-full max-w-full md:max-w-[480px]">
              
              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                className="bg-white rounded-[24px] min-h-[72px] md:h-[76px] flex items-center p-[12px] pr-[16px] gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[46px] h-[46px] rounded-full bg-[#ffecf5] flex items-center justify-center shrink-0 ml-[4px]">
                  <Paintbrush className="w-[20px] h-[20px] text-[#ff008c]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[14px] md:text-[15px] leading-[1.2]">Interfaz intuitiva y bella</h4>
                  <p className="text-[#6c88a0] font-[500] text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Diseño premium hecho para inspirar tu creatividad.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.18, ease: "easeOut" }}
                className="bg-white rounded-[24px] min-h-[72px] md:h-[76px] flex items-center p-[12px] pr-[16px] gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[46px] h-[46px] rounded-full bg-[#e6f4ff] flex items-center justify-center shrink-0 ml-[4px]">
                  <RefreshCw className="w-[20px] h-[20px] text-[#008cff]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[14px] md:text-[15px] leading-[1.2]">Siempre actualizado</h4>
                  <p className="text-[#6c88a0] font-[500] text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Nuevo contenido cada semana: cursos, lives y tips.</p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.26, ease: "easeOut" }}
                className="bg-white rounded-[24px] min-h-[72px] md:h-[76px] flex items-center p-[12px] pr-[16px] gap-[18px] shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:translate-x-[4px] transition-transform duration-300"
              >
                <div className="w-[46px] h-[46px] rounded-full bg-[#e5fcf2] flex items-center justify-center shrink-0 ml-[4px]">
                  <Calendar className="w-[20px] h-[20px] text-[#00b87a]" strokeWidth={2} />
                </div>
                <div className="flex flex-col justify-center">
                  <h4 className="text-[#0c1830] font-[750] text-[14px] md:text-[15px] leading-[1.2]">Calendario de lives en vivo</h4>
                  <p className="text-[#6c88a0] font-[500] text-[13px] md:text-[14px] mt-[3px] leading-[1.2]">Nunca te pierdas una clase — recibe recordatorios.</p>
                </div>
              </motion.div>
              
            </div>

            {/* Botones */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35, ease: "easeOut" }}
              className="mt-[32px] md:mt-[42px] flex flex-col sm:flex-row gap-[16px]"
            >
              <button 
                onClick={() => navigate("/register")}
                className="w-full sm:w-auto h-[54px] md:h-[58px] px-[32px] rounded-[20px] text-white font-[700] text-[15px] md:text-[16px] flex justify-center items-center hover:-translate-y-[2px] transition-all duration-300"
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
                className="w-full sm:w-auto h-[54px] md:h-[58px] px-[32px] rounded-[20px] bg-[#fcf1e8] text-[#0c1830] font-[650] text-[15px] md:text-[16px] flex justify-center items-center hover:bg-[#faebd9] hover:-translate-y-[2px] transition-all duration-300"
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
    </div>
  );
}
