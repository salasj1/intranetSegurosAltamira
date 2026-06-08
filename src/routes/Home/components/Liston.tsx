import styles from '../styles/Carrusel.module.css';

interface ListonProps {
  texto: string;
  color?: 'azul' | 'naranja';
  textoAzul?: boolean;
}

function Liston({ texto, color = 'azul', textoAzul = false }: ListonProps) {
  const isNaranja = color === 'naranja';
  const tailId = isNaranja ? 'liston-tail-orange' : 'liston-tail-blue';
  const mainId = isNaranja ? 'liston-main-orange' : 'liston-main-blue';
  const foldColor = isNaranja ? '#7a3508' : '#000d33';

  return (
    <div className={styles.listonWrap}>
      <svg className={styles.listonSvg} viewBox="0 0 900 140" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="liston-main-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1565c0" />
            <stop offset="55%" stopColor="#003896" />
            <stop offset="100%" stopColor="#002064" />
          </linearGradient>
          <linearGradient id="liston-tail-blue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#002064" />
            <stop offset="100%" stopColor="#000d33" />
          </linearGradient>
          <linearGradient id="liston-main-orange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffa05a" />
            <stop offset="55%" stopColor="#f48134" />
            <stop offset="100%" stopColor="#c45a14" />
          </linearGradient>
          <linearGradient id="liston-tail-orange" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c45a14" />
            <stop offset="100%" stopColor="#7a3508" />
          </linearGradient>
        </defs>

        {/* Cola izquierda */}
        <path
          d="M 90,75 L 150,60 L 150,120 L 90,135 L 115,105 Z"
          fill={`url(#${tailId})`}
        />
        {/* Sombra de pliegue izquierdo */}
        <path
          d="M 150,60 L 158,75 L 158,120 L 150,128 Z"
          fill={foldColor}
          opacity="0.75"
        />

        {/* Cola derecha */}
        <path
          d="M 810,75 L 750,60 L 750,120 L 810,135 L 785,105 Z"
          fill={`url(#${tailId})`}
        />
        {/* Sombra de pliegue derecho */}
        <path
          d="M 750,60 L 742,75 L 742,120 L 750,128 Z"
          fill={foldColor}
          opacity="0.75"
        />

        {/* Cuerpo principal — arqueado */}
        <path
          d="M 150,30 Q 450,18 750,30 L 750,110 Q 450,98 150,110 Z"
          fill={`url(#${mainId})`}
        />

        {/* Brillo superior */}
        <path
          d="M 150,30 Q 450,18 750,30 L 750,55 Q 450,43 150,55 Z"
          fill="rgba(255,255,255,0.10)"
        />
      </svg>
      <div
        className={styles.listonText}
        style={{
          color: textoAzul ? '#003896' : '#fff',
          textShadow: textoAzul
            ? '1px 1px 2px rgba(255,255,255,0.55)'
            : '2px 2px 6px rgba(0, 0, 0, 0.65)',
        }}
      >
        {texto}
      </div>
    </div>
  );
}

export default Liston;