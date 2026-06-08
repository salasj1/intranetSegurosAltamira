import { useMemo } from 'react';
import styles from '../styles/Carrusel.module.css';

const BALLOON_COLORS = ['#f48134', '#1565c0', '#ffeadb', '#fd8719', '#4f7ccf', '#ffffff', '#ffd29b', '#003896'];
const CONFETTI_COLORS = ['#f48134', '#1565c0', '#fd8719', '#ffeadb', '#ffffff', '#ffd29b', '#4f7ccf'];

function seeded(i: number, salt = 1) {
  const x = Math.sin(i * 999.1 + salt * 17.3) * 10000;
  return x - Math.floor(x);
}

function Balloon({ color, size, highlight }: { color: string; size: number; highlight: string }) {
  const w = size, h = size * 1.25;
  const gid = `bg-${color.replace('#', '')}-${size}`;
  return (
    <svg width={w} height={h + 60} viewBox={`0 0 ${w} ${h + 60}`} style={{ display: 'block', overflow: 'visible' }}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor={highlight} stopOpacity="0.95" />
          <stop offset="40%" stopColor={color} />
          <stop offset="100%" stopColor={color} />
        </radialGradient>
      </defs>
      <path d={`M ${w / 2} ${h} Q ${w / 2 - 8} ${h + 25}, ${w / 2 + 4} ${h + 60}`} stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
      <polygon points={`${w / 2 - 5},${h - 2} ${w / 2 + 5},${h - 2} ${w / 2},${h + 6}`} fill={color} />
      <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={`url(#${gid})`} />
      <ellipse cx={w * 0.32} cy={h * 0.3} rx={w * 0.13} ry={h * 0.18} fill="rgba(255,255,255,0.55)" />
      <ellipse cx={w * 0.4} cy={h * 0.22} rx={w * 0.04} ry={h * 0.06} fill="rgba(255,255,255,0.9)" />
    </svg>
  );
}

export function Balloons({ count = 22, speedMul = 1 }: { count?: number; speedMul?: number }) {
  const balloons = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const color = BALLOON_COLORS[i % BALLOON_COLORS.length];
    const size = 36 + Math.floor(seeded(i, 2) * 36);
    const left = seeded(i, 3) * 100;
    const duration = (7 + seeded(i, 4) * 6) / speedMul;
    const delay = -seeded(i, 5) * duration;
    const swayDur = 2.4 + seeded(i, 6) * 1.6;
    const swayAmt = 18 + seeded(i, 7) * 22;
    const drift = (seeded(i, 8) - 0.5) * 12;
    return { i, color, size, left, duration, delay, swayDur, swayAmt, drift };
  }), [count, speedMul]);

  return (
    <div className={`${styles.fxLayer} ${styles.fxBalloons}`} aria-hidden="true">
      {balloons.map(b => (
        <div key={b.i} className={styles.balloonTrack}
          style={{
            left: `${b.left}%`,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            ['--drift' as any]: `${b.drift}vw`,
          }}>
          <div className={styles.balloonSway}
            style={{
              animationDuration: `${b.swayDur}s`,
              animationDelay: `${b.delay / 2}s`,
              ['--sway' as any]: `${b.swayAmt}px`,
            }}>
            <Balloon color={b.color} size={b.size} highlight={b.color === '#ffffff' ? '#ffeadb' : '#ffffff'} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Confetti({ count = 80, speedMul = 1 }: { count?: number; speedMul?: number }) {
  const pieces = useMemo(() => Array.from({ length: count }).map((_, i) => {
    const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const shape = i % 5;
    const size = 6 + Math.floor(seeded(i, 11) * 10);
    const left = seeded(i, 12) * 100;
    const duration = (4.5 + seeded(i, 13) * 4) / speedMul;
    const delay = -seeded(i, 14) * duration;
    const spinDur = 0.8 + seeded(i, 15) * 1.6;
    const drift = (seeded(i, 16) - 0.5) * 30;
    const startRot = Math.floor(seeded(i, 17) * 360);
    return { i, color, shape, size, left, duration, delay, spinDur, drift, startRot };
  }), [count, speedMul]);

  return (
    <div className={`${styles.fxLayer} ${styles.fxConfetti}`} aria-hidden="true">
      {pieces.map(p => (
        <div key={p.i} className={styles.confettiTrack}
          style={{
            left: `${p.left}%`,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            ['--drift' as any]: `${p.drift}vw`,
          }}>
          <div className={`${styles.confettiSpin} ${styles[`shape${p.shape}`]}`}
            style={{
              width: `${p.size}px`,
              height: `${p.size * (p.shape === 1 ? 0.4 : p.shape === 2 ? 1 : 0.6)}px`,
              background: p.shape === 3 ? 'transparent' : p.color,
              borderColor: p.color,
              animationDuration: `${p.spinDur}s`,
              animationDelay: `${p.delay / 2}s`,
              ['--start-rot' as any]: `${p.startRot}deg`,
            }} />
        </div>
      ))}
    </div>
  );
}

export function Sparkles({ count = 18 }: { count?: number }) {
  const stars = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    i, left: seeded(i, 21) * 100, top: seeded(i, 22) * 90,
    size: 3 + seeded(i, 23) * 5, delay: -seeded(i, 24) * 3, dur: 1.6 + seeded(i, 25) * 2,
  })), [count]);

  return (
    <div className={`${styles.fxLayer} ${styles.fxSparkles}`} aria-hidden="true">
      {stars.map(s => (
        <div key={s.i} className={styles.sparkle}
          style={{
            left: `${s.left}%`, top: `${s.top}%`,
            width: `${s.size}px`, height: `${s.size}px`,
            animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s`,
          }} />
      ))}
    </div>
  );
}

export function BurstOverlay({ trigger }: { trigger: number }) {
  const pieces = useMemo(() => Array.from({ length: 28 }).map((_, i) => {
    const colors = ['#f48134', '#1565c0', '#ffeadb', '#fd8719', '#ffffff', '#4f7ccf'];
    return {
      i,
      angle: (360 / 28) * i + (i % 3) * 5,
      dist: 220 + (i % 5) * 40,
      color: colors[i % colors.length],
      size: 8 + (i % 4) * 3,
      delay: (i % 6) * 0.02,
    };
  }), []);
  if (!trigger) return null;
  return (
    <div className={styles.burstOverlay} key={trigger}>
      {pieces.map(p => (
        <div key={p.i} className={styles.burstPiece}
          style={{
            background: p.color, width: `${p.size}px`, height: `${p.size}px`,
            ['--rot' as any]: `${p.angle}deg`,
            ['--burst-dist' as any]: `-${p.dist}px`,
            animationDelay: `${p.delay}s`,
          }} />
      ))}
    </div>
  );
}