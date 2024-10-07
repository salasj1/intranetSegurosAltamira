import { useState } from 'react';
import AcordionPermisos from '../components/AcordionPermisos';
import AcordionSolicitarPermiso from '../components/AcordionSolicitarPermisos';
import NavbarEmpresa from '../components/NavbarEmpresa';
import styles from '../css/SolicitarProcesos.module.css';

function SolicitarPermisos() {
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  return (
    <>
      <NavbarEmpresa />
      <div className={styles.canvas}>
        <h1 className={styles.h1}>Solicitar Permisos</h1>
        <AcordionSolicitarPermiso onRefresh={handleRefresh} />
        <br />
        <br />
        <br />
        <br />
        <h3 className={styles.h3}>Permisos Solicitados</h3>
        <AcordionPermisos refresh={refresh} />
      </div>
    </>
  );
}

export default SolicitarPermisos;