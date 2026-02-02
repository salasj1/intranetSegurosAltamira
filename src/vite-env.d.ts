/// <reference types="vite/client" />

// Declaraciones para archivos CSS y módulos CSS


// Asegurar que las imágenes se reconozcan (por si acaso)
declare module '*.png';
declare module '*.svg';
declare module '*.jpeg';
declare module '*.jpg';
declare module '*.module.css';
declare module '*.css';
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}