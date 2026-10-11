import React from "react";

interface PricingBackgroundProps {
  className?: string;
}

const PARTICLES = [
  { left: "12%", bottom: "12%", size: 3, delay: "0s", duration: "4.2s" },
  { left: "20%", bottom: "22%", size: 4, delay: "1.4s", duration: "3.6s" },
  { left: "28%", bottom: "9%", size: 2.5, delay: "2.8s", duration: "5.1s" },
  { left: "36%", bottom: "19%", size: 3, delay: "0.7s", duration: "4.5s" },
  { left: "44%", bottom: "11%", size: 4, delay: "3.2s", duration: "3.9s" },
  { left: "53%", bottom: "24%", size: 2.5, delay: "1.9s", duration: "4.8s" },
  { left: "62%", bottom: "14%", size: 3.5, delay: "2.3s", duration: "3.7s" },
  { left: "71%", bottom: "27%", size: 4, delay: "0.5s", duration: "5.4s" },
  { left: "80%", bottom: "10%", size: 2.5, delay: "2.1s", duration: "4.1s" },
  { left: "89%", bottom: "21%", size: 3, delay: "2.9s", duration: "3.5s" },
  // Destellos tipo estrella pequeños
  { left: "24%", bottom: "16%", size: 5, delay: "1.2s", duration: "4.6s", isStar: true },
  { left: "76%", bottom: "18%", size: 5, delay: "2.5s", duration: "4.2s", isStar: true },
];

export const PricingBackground: React.FC<PricingBackgroundProps> = ({ className = "" }) => {
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{
        background:
          "linear-gradient(180deg, #24021e 0%, #17021a 18%, #08010c 42%, #08010c 65%, #120216 86%, #18031d 100%)",
      }}
    >
      {/* Estilos de animación embebidos para respiración y flicker suaves */}
      <style>{`
        @keyframes pricing-glow-breathe-left {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1) translate3d(0, 0, 0);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08) translate3d(8px, -6px, 0);
          }
        }
        @keyframes pricing-glow-breathe-right {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1) translate3d(0, 0, 0);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.08) translate3d(-8px, -6px, 0);
          }
        }
        @keyframes pricing-particle-flicker {
          0%, 100% {
            opacity: 0.2;
            transform: scale(0.8);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.2);
          }
        }
        @keyframes pricing-line-glow {
          0%, 100% {
            opacity: 0.7;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>

      {/* ── PARTE SUPERIOR ── */}

      {/* Franja de glow horizontal difuso en el borde superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[90px] sm:h-[130px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255, 0, 140, 0.28) 0%, rgba(255, 0, 140, 0.08) 45%, transparent 100%)",
          filter: "blur(18px)",
          animation: "pricing-line-glow 7s ease-in-out infinite",
        }}
      />

      {/* Línea luminosa difusa y nítida en el borde superior */}
      <div
        className="absolute top-0 left-0 right-0 h-[1.5px]"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255, 0, 140, 0.25) 15%, rgba(255, 0, 150, 0.95) 50%, rgba(255, 0, 140, 0.25) 85%, transparent 100%)",
          boxShadow: "0 0 14px 2px rgba(255, 0, 140, 0.75)",
        }}
      />

      {/* Mancha de luz superior izquierda (rosa/fucsia neón suave) */}
      <div
        className="absolute -top-28 sm:-top-36 -left-20 sm:-left-28 w-[380px] sm:w-[580px] h-[360px] sm:h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 40% 40%, rgba(255, 0, 140, 0.42) 0%, rgba(192, 0, 120, 0.24) 45%, transparent 72%)",
          filter: "blur(75px)",
          animation: "pricing-glow-breathe-left 8.5s ease-in-out infinite",
        }}
      />

      {/* Mancha de luz superior derecha (rosa/fucsia neón suave) */}
      <div
        className="absolute -top-28 sm:-top-36 -right-20 sm:-right-28 w-[380px] sm:w-[580px] h-[360px] sm:h-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle at 60% 40%, rgba(255, 0, 125, 0.4) 0%, rgba(142, 0, 95, 0.22) 48%, transparent 72%)",
          filter: "blur(75px)",
          animation: "pricing-glow-breathe-right 9s ease-in-out infinite 1s",
        }}
      />

      {/* ── PARTE MEDIA ── */}

      {/* Líneas horizontales muy sutiles y semitransparentes para estructura y profundidad */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0px, transparent 55px, rgba(255, 0, 140, 0.035) 56px)",
          maskImage:
            "radial-gradient(ellipse 85% 65% at 50% 50%, black 25%, transparent 85%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 85% 65% at 50% 50%, black 25%, transparent 85%)",
          opacity: 0.9,
        }}
      />

      {/* Viñeteado lateral muy tenue para centrar la atención */}
      <div
        className="absolute inset-y-0 left-0 w-24 sm:w-48 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, rgba(6, 1, 10, 0.75) 0%, transparent 100%)",
        }}
      />
      <div
        className="absolute inset-y-0 right-0 w-24 sm:w-48 pointer-events-none"
        style={{
          background: "linear-gradient(270deg, rgba(6, 1, 10, 0.75) 0%, transparent 100%)",
        }}
      />

      {/* ── PARTE INFERIOR ── */}

      {/* Glow difuso central inferior (nube luminosa tenue) */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[460px] sm:w-[780px] h-[190px] sm:h-[260px] rounded-[100%]"
        style={{
          background:
            "radial-gradient(ellipse at 50% 100%, rgba(255, 0, 140, 0.2) 0%, rgba(135, 0, 80, 0.1) 50%, transparent 75%)",
          filter: "blur(65px)",
        }}
      />

      {/* Partículas pequeñas y destellos dispersos en color rosa/fucsia */}
      {PARTICLES.map((p, idx) => (
        <div
          key={idx}
          className="absolute pointer-events-none"
          style={{
            left: p.left,
            bottom: p.bottom,
            width: `${p.size}px`,
            height: `${p.size}px`,
            animation: `pricing-particle-flicker ${p.duration} ease-in-out infinite`,
            animationDelay: p.delay,
          }}
        >
          {p.isStar ? (
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{
                filter: "drop-shadow(0 0 5px rgba(255, 0, 140, 0.8))",
              }}
            >
              <div className="absolute w-full h-[1px] bg-[#ff2fa3]" />
              <div className="absolute h-full w-[1px] bg-[#ff2fa3]" />
              <div className="w-1.5 h-1.5 rounded-full bg-white opacity-80" />
            </div>
          ) : (
            <div
              className="w-full h-full rounded-full bg-[#ff0099]"
              style={{
                boxShadow: `0 0 ${p.size * 2.5}px rgba(255, 0, 140, 0.85)`,
              }}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PricingBackground;
