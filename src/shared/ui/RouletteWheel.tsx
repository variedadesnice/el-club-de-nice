export interface WheelSegment {
  id: string;
  label: string;
  color: string;
}

export default function RouletteWheel({ prizes }: { prizes: WheelSegment[] }) {
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
