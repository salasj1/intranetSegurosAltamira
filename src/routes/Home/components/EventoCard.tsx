import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import styles from '../styles/EventoCard.module.css';
import EventoGalleryModal from './EventoGalleryModal';
import galeriaFotoFondo from '@/assets/webp/galeria.webp';

const apiUrl = import.meta.env.VITE_API_URL;

interface EventoCardProps {
  parentFolderId: string;
}

const EventoCard: React.FC<EventoCardProps> = ({ parentFolderId }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [titulo, setTitulo] = useState('Galería de fotos');

  useEffect(() => {
    axios
      .get(`${apiUrl}/galeria/titulo`)
      .then((res) => {
        if (res.data?.titulo) setTitulo(res.data.titulo);
      })
      .catch(() => {
        // Mantiene el valor por defecto si falla
      });
  }, []);

  return (
    <section className={styles.sectionContainer}>
      {/* Imagen de fondo */}
      <div
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url("${galeriaFotoFondo}")` }}
      />
      {/* Overlay degradado para legibilidad */}
      {/* <div className={styles.gradientOverlay} /> */}

      {/* Contenido */}
      <div className={styles.contentLayer}>
        <motion.span
          className={styles.badge}
          initial={{ opacity: 0, y: -10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Celebración Especial
        </motion.span>
        <div style={{ height: "100px" }}>
          <motion.h2
            className={styles.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            {titulo}
          </motion.h2>
        </div>


        <motion.button
          className={styles.ctaButton}
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
        >
          Ver Galería
        </motion.button>
      </div>

      <EventoGalleryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        parentFolderId={parentFolderId}
        eventTitle={titulo}
      />
    </section>
  );
};

export default EventoCard;
