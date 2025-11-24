import React, { useState } from 'react';
import styles from '../styles/ExpedienteEmpleado.module.css';
import { FaUser, FaRoute, FaFileAlt, FaTimes, FaBars } from 'react-icons/fa';

interface PhaseNavigatorProps {
  currentPhase: number;
  onNavigate: (phase: number) => void;
}

const phases = [
  { number: 1, label: 'Datos Personales', icon: <FaUser /> },
  { number: 2, label: 'Rutograma', icon: <FaRoute /> },
  { number: 3, label: 'Documentos', icon: <FaFileAlt /> },
];

const PhaseNavigator: React.FC<PhaseNavigatorProps> = ({ currentPhase, onNavigate }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const activeIndex = phases.findIndex(p => p.number === currentPhase);

  const handleNavigation = (phase: number) => {
    onNavigate(phase);
    setIsMobileMenuOpen(false); // Cierra el menú al navegar
  };


  return (
    <>
    <button 
        className={styles.hamburgerBtn} 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation"
      >
        {isMobileMenuOpen ? <FaTimes size={60} /> : <FaBars size={60} />}
      </button>
    <nav className={`${styles.phaseNavigator} ${isMobileMenuOpen ? styles.mobileMenuOpen : ''}`}>
        <div 
          className={styles.phaseIndicator} 
          style={{ transform: `translateY(${activeIndex * 100}%)` }}
        />
        <ul>
          {phases.map((phase) => (
            <li
              key={phase.number}
              className={phase.number === currentPhase ? styles.active : ''}
            >
              <button onClick={() => handleNavigation(phase.number)}>
                <span className={styles.phaseIcon}>{phase.icon}</span>
                <span className={styles.phaseLabel}>{phase.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
};

export default PhaseNavigator;