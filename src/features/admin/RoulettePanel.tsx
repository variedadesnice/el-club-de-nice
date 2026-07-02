import React, { useRef, useState } from "react";
import { motion, AnimatePresence, useMotionValue, animate } from "motion/react";
import { Gift, Plus, RotateCw, Trash2, Trophy, X } from "lucide-react";

const PALETTE = [
  "#6366f1", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#8b5cf6", "#f97316", "#14b8a6",
  "#ec4899", "#84cc16", "#06b6d4", "#a855f7",
];

interface Prize {
  id: string;
  label: string;
  color: string;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const STORAGE_KEY = "roulette_prizes_v1";

function loadPrizes(): Prize[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Prize[];
  } catch {/* ignore */}
  return [
    { id: genId(), label: "Premio 1", color: PALETTE[0] },
    { id: genId(), label: "Premio 2", color: PALETTE[1] },
    { id: genId(), label: "Premio 3", color: PALETTE[2] },
    { id: genId(), label: "Premio 4", color: PALETTE[3] },
  ];
}

function savePrizes(prizes: Prize[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prizes)); } catch {/* ignore */}
}

// ─── SVG Wheel ──────────────────────────────────────────────────────────────

function WheelSvg({ prizes }: { prizes: Prize[] }) {
  const cx = 160, cy = 160, r = 148;
  const n = prizes.length;

  if (n === 0) {
    return (
      <svg viewBox="0 0 320 320" className="w-full h-full">
        <circle cx={cx} cy={cy} r={r} fill="#f1f5f9" stroke="#e2e8f0" strokeWidth={3} />
        <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle" fill="#94a3b8" fontSize={14} fontWeight="900">
          Sin premios
        </text>
      </svg>
    );
  }

  const segDeg = 360 / n;

  const segments = prizes.map((prize, i) => {
    const startRad = (i * segDeg - 90) * (Math.PI / 180);
    const endRad = ((i + 1) * segDeg - 90) * (Math.PI / 180);
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const large = segDeg > 180 ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1.toFixed(3)} ${y1.toFixed(3)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(3)} ${y2.toFixed(3)} Z`;

    const midRad = (i * segDeg + segDeg / 2 - 90) * (Math.PI / 180);
    const tr = r * 0.64;
    const tx = cx + tr * Math.cos(midRad);
    const ty = cy + tr * Math.sin(midRad);
    const textRotate = i * segDeg + segDeg / 2;

    const fontSize = n > 10 ? 9 : n > 6 ? 11 : 13;
    const maxLen = n > 8 ? 7 : n > 5 ? 10 : 13;
    const label = prize.label.length > maxLen ? prize.label.slice(0, maxLen - 1) + "…" : prize.label;

    return { d, color: prize.color, label, tx, ty, textRotate, fontSize };
  });

  return (
    <svg viewBox="0 0 320 320" className="w-full h-full">
      <defs>
        <filter id="rw-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#00000020" />
        </filter>
      </defs>
      <g filter="url(#rw-shadow)">
        {segments.map((seg, i) => (
          <g key={i}>
            <path d={seg.d} fill={seg.color} stroke="white" strokeWidth={2.5} />
            <text
              x={seg.tx} y={seg.ty}
              textAnchor="middle" dominantBaseline="middle"
              fill="white" fontSize={seg.fontSize} fontWeight="900"
              style={{ userSelect: "none" }}
              transform={`rotate(${seg.textRotate}, ${seg.tx.toFixed(3)}, ${seg.ty.toFixed(3)})`}
            >
              {seg.label}
            </text>
          </g>
        ))}
        {/* Center hub */}
        <circle cx={cx} cy={cy} r={22} fill="white" stroke="#e2e8f0" strokeWidth={4} />
        <circle cx={cx} cy={cy} r={10} fill="#6366f1" />
      </g>
    </svg>
  );
}

// ─── Main Panel ─────────────────────────────────────────────────────────────

export default function RoulettePanel() {
  const [prizes, setPrizes] = useState<Prize[]>(loadPrizes);
  const [newPrize, setNewPrize] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState<Prize | null>(null);

  const rotationMV = useMotionValue(0);
  const totalRotationRef = useRef(0);

  function syncPrizes(next: Prize[]) {
    setPrizes(next);
    savePrizes(next);
  }

  function addPrize() {
    const label = newPrize.trim();
    if (!label || prizes.length >= 12) return;
    const next = [...prizes, { id: genId(), label, color: PALETTE[prizes.length % PALETTE.length] }];
    syncPrizes(next);
    setNewPrize("");
  }

  function removePrize(id: string) {
    if (prizes.length <= 2) return;
    syncPrizes(prizes.filter(p => p.id !== id));
  }

  function updateLabel(id: string, label: string) {
    const next = prizes.map(p => p.id === id ? { ...p, label } : p);
    syncPrizes(next);
  }

  async function spin() {
    if (spinning || prizes.length < 2) return;
    setSpinning(true);
    setWinner(null);

    const n = prizes.length;
    const winnerIdx = Math.floor(Math.random() * n);
    const segDeg = 360 / n;
    const winnerMid = winnerIdx * segDeg + segDeg / 2;

    // Angle the winner segment needs to reach (top = 0°)
    const targetAngle = (360 - (winnerMid % 360)) % 360;
    // Current visual position of the wheel
    const currentAngle = totalRotationRef.current % 360;
    // How many extra degrees to rotate from current position to align winner at top
    const deltaAngle = (targetAngle - currentAngle + 360) % 360;
    const target = totalRotationRef.current + 1440 + deltaAngle; // 4 full turns + alignment

    await animate(rotationMV, target, {
      duration: 4.5,
      ease: [0.2, 1, 0.3, 1],
    });

    totalRotationRef.current = target;
    setWinner(prizes[winnerIdx]);
    setSpinning(false);
  }

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Wheel side ── */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col items-center gap-6">
          <div className="text-center">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 justify-center">
              <Gift className="text-indigo-600" size={20} /> Ruleta de Premios
            </h3>
            <p className="text-slate-400 font-medium text-sm mt-1">
              {prizes.length < 2 ? "Agrega al menos 2 premios para girar" : `${prizes.length} premios · gira y descubre el ganador`}
            </p>
          </div>

          {/* Wheel + pointer */}
          <div className="relative w-full max-w-[320px] aspect-square select-none">
            {/* Pointer triangle */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-10 drop-shadow-lg">
              <div
                className="w-0 h-0"
                style={{
                  borderLeft: "14px solid transparent",
                  borderRight: "14px solid transparent",
                  borderTop: "28px solid #4f46e5",
                }}
              />
            </div>

            <motion.div style={{ rotate: rotationMV }} className="w-full h-full">
              <WheelSvg prizes={prizes} />
            </motion.div>
          </div>

          <button
            onClick={spin}
            disabled={spinning || prizes.length < 2}
            className="flex items-center gap-2.5 bg-indigo-600 text-white px-8 py-3.5 rounded-2xl font-black text-sm hover:bg-indigo-700 active:scale-95 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCw size={18} className={spinning ? "animate-spin" : ""} />
            {spinning ? "Girando..." : "¡Girar Ruleta!"}
          </button>
        </div>

        {/* ── Prize editor side ── */}
        <div className="bg-white rounded-3xl sm:rounded-[2rem] border border-slate-200 shadow-sm p-6 sm:p-8 flex flex-col gap-5">
          <div>
            <h4 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Trophy size={18} className="text-indigo-600" /> Configurar Premios
            </h4>
            <p className="text-slate-400 text-sm font-medium mt-1">
              Edita los premios de cada segmento. Se guardan automáticamente.
            </p>
          </div>

          {/* Add prize */}
          <form
            onSubmit={e => { e.preventDefault(); addPrize(); }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={newPrize}
              onChange={e => setNewPrize(e.target.value)}
              placeholder="Nombre del premio..."
              maxLength={30}
              className="flex-1 min-w-0 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm font-bold outline-none focus:border-indigo-400 transition-colors"
            />
            <button
              type="submit"
              disabled={!newPrize.trim() || prizes.length >= 12}
              className="flex-shrink-0 p-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-40"
              title="Agregar premio"
            >
              <Plus size={18} />
            </button>
          </form>

          {/* Prize list */}
          <div className="flex-1 space-y-2 overflow-y-auto max-h-[360px] pr-0.5">
            <AnimatePresence initial={false}>
              {prizes.map((prize, i) => (
                <motion.div
                  key={prize.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10, height: 0, marginBottom: 0 }}
                  className="flex items-center gap-2.5 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100"
                >
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 ring-2 ring-white shadow-sm"
                    style={{ backgroundColor: prize.color }}
                  />
                  <span className="text-[11px] font-black text-slate-400 w-5 flex-shrink-0 text-center">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={prize.label}
                    onChange={e => updateLabel(prize.id, e.target.value)}
                    maxLength={30}
                    className="flex-1 min-w-0 bg-transparent font-bold text-sm text-slate-800 outline-none"
                  />
                  <button
                    onClick={() => removePrize(prize.id)}
                    disabled={prizes.length <= 2}
                    className="flex-shrink-0 p-1 text-slate-300 hover:text-red-400 transition-colors disabled:opacity-20"
                    title="Eliminar"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {prizes.length >= 12 && (
            <p className="text-xs font-bold text-amber-500 text-center">Máximo 12 premios alcanzado</p>
          )}
        </div>
      </div>

      {/* ── Winner modal ── */}
      <AnimatePresence>
        {winner && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setWinner(null)}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.75, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.75, opacity: 0 }}
              transition={{ type: "spring", stiffness: 320, damping: 22 }}
              className="relative bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl text-center"
            >
              <button
                onClick={() => setWinner(null)}
                className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>

              <motion.div
                initial={{ scale: 0.5, rotate: -15 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                className="w-24 h-24 rounded-full mx-auto mb-5 flex items-center justify-center shadow-2xl"
                style={{ backgroundColor: winner.color }}
              >
                <Gift size={42} className="text-white" />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  ¡Premio seleccionado!
                </p>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 break-words">
                  {winner.label}
                </h2>
              </motion.div>

              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                onClick={() => setWinner(null)}
                className="mt-7 px-8 py-3 bg-indigo-600 text-white font-black rounded-2xl hover:bg-indigo-700 transition-colors text-sm shadow-lg shadow-indigo-100"
              >
                Cerrar
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
