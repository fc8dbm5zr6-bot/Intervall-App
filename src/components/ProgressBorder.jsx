import { useEffect, useState } from 'react';

const PHASE_COLORS = {
  warmup: '#f59e0b',
  work: '#22c55e',
  rest: '#ef4444',
  roundRest: '#3b82f6',
};

function isNativeApp() {
  return window.Capacitor?.isNativePlatform?.() || false;
}

export default function ProgressBorder({ timer, showPercent }) {
  const { phase, elapsed, totalDuration } = timer;
  const [dims, setDims] = useState(null);

  useEffect(() => {
    function measure() {
      setDims({ w: window.innerWidth, h: window.innerHeight });
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const isActive = phase !== 'idle' && phase !== 'finished';
  if (!isActive || !totalDuration || !dims) return null;

  const progress = Math.min(elapsed / totalDuration, 1);
  const percent = Math.round(progress * 100);
  const color = PHASE_COLORS[phase] || '#3b82f6';

  const { w, h } = dims;
  const strokeWidth = 24;
  const native = isNativeApp();
  // Native iOS: push top down below Dynamic Island (59px safe area + gap)
  const topInset = native ? 62 : 0;
  const bottomInset = 0;
  const r = 30;

  const x1 = 0;
  const y1 = topInset;
  const x2 = w;
  const y2 = h - bottomInset;
  const midX = w / 2;
  const rectW = x2 - x1;
  const rectH = y2 - y1;

  const straight = 2 * (rectW - 2 * r) + 2 * (rectH - 2 * r);
  const corners = 2 * Math.PI * r;
  const pathLength = straight + corners;
  const dashOffset = pathLength * (1 - progress);

  // Path hugs the very edge; strokeAlign inside via clip
  const d = [
    `M ${midX} ${y1}`,
    `L ${x2 - r} ${y1}`,
    `A ${r} ${r} 0 0 1 ${x2} ${y1 + r}`,
    `L ${x2} ${y2 - r}`,
    `A ${r} ${r} 0 0 1 ${x2 - r} ${y2}`,
    `L ${x1 + r} ${y2}`,
    `A ${r} ${r} 0 0 1 ${x1} ${y2 - r}`,
    `L ${x1} ${y1 + r}`,
    `A ${r} ${r} 0 0 1 ${x1 + r} ${y1}`,
    `Z`,
  ].join(' ');

  // Clip rect to show only the inner half of the stroke
  const clipId = 'border-clip';
  const percentTop = topInset + strokeWidth + 6;

  return (
    <div className="progress-border">
      <svg
        width={w}
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 90 }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={x1} y={y1} width={rectW} height={rectH} rx={r} ry={r} />
          </clipPath>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <path d={d} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeWidth * 2} />
          <path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth * 2}
            strokeLinecap="round"
            strokeDasharray={pathLength}
            strokeDashoffset={dashOffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </g>
      </svg>

      {showPercent && (
        <div className="progress-percent" style={{ color, top: percentTop }}>
          {percent}%
        </div>
      )}
    </div>
  );
}
