import React, { useEffect, useRef, useState } from 'react';
import styles from '../css/RRHHExpedientes.module.css';

interface AnimatedCounterProps {
  value: number;
  label?: string;
  color?: string;
  bgColor?: string;
  duration?: number; // ms
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, label, color, bgColor, duration = 900 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<number>(20);

  useEffect(() => {
    let start = ref.current;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(start + (value - start) * progress);
      setDisplayValue(current);
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplayValue(value);
        ref.current = value;
      }
    };
    requestAnimationFrame(step);
    // eslint-disable-next-line
  }, [value]);

  return (
    <div
      className={styles.counterBoxRRHH}
      style={{
        color: color || '#003391',
        background: bgColor || '#eaf1ff',
        border: `2px solid ${color || '#003391'}`,
        borderRadius: 16,
        minWidth: 90,
        minHeight: 60,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 28,
        boxShadow: '0 2px 8px #00339122',
        marginRight: 16,
        marginBottom: 8,
      }}
    >
      {label && <span className={styles.counterLabelRRHH}>{label}</span>}
      <span>{displayValue}</span>
      
    </div>
  );
};

export default AnimatedCounter;
