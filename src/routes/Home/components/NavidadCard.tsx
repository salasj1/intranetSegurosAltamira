import React, { useState } from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/NavidadCard.module.css';

import NavidadGalleryModal from './NavidadGalleryModal';

import FotoEquipo from '@/assets/Navidad/Equipo.jpeg';

interface NavidadCardProps {}

const NavidadCard: React.FC<NavidadCardProps> = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // URL de imagen de fondo navideña (puedes cambiarla por una local si prefieres)
  const backgroundImageUrl = "https://www.puromarketing.com/uploads/img/contents/2023/XgKmhtup6WMl32kbeHrY/XgKmhtup6WMl32kbeHrY_post_imagen_top_content.webp";

  return (
    <section className={styles.sectionContainer}>
      {/* Capa de fondo con imagen */}
      <div 
        className={styles.backgroundLayer}
        style={{ backgroundImage: `url("${FotoEquipo}")` }}
      />

      {/* Capa de contenido */}
      <div className={styles.contentLayer}>
        <motion.h2 
          className={styles.title}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Galería Navideña 2025
        </motion.h2>

        <motion.p 
          className={styles.subtitle}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Revive la magia, las sonrisas y los mejores momentos de nuestra celebración de la empresa.
        </motion.p>

        <motion.button 
          className={styles.ctaButton}
          onClick={() => setIsModalOpen(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.1, delay: 0 }}
        >
          Ver Fotos 📸
        </motion.button>
      </div>

      <div className={styles.snow}>❄️</div>

      {/* Modal de galería navideña */}
      <NavidadGalleryModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </section>
  );
};

export default NavidadCard;