import React, { useState, useEffect } from 'react';
import NavbarEmpresa from '../components/NavbarEmpresa';
import ListaAprobacionPermisos from '../components/ListaAprobacionPermisos';
import axios from 'axios'; 
import { useAuth } from '../auth/AuthProvider';
function AprobarPermisos() {
  const [permisos, setPermisos] = useState([]);
  const { cod_emp } = useAuth();
  const fetchPermisos = async () => {
    try {
      const response = await axios.get(`/api/permisos/supervisor/${cod_emp}`);
      setPermisos(response.data);
    } catch (error) {
      console.error('Error al obtener permisos:', error);
    }
  };

  useEffect(() => {
    fetchPermisos();
  }, []);

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1>Aprobar Permisos</h1>
        <br />
        <ListaAprobacionPermisos permisos={permisos} fetchPermisos={fetchPermisos} />
      </div>
    </>
  );
}

export default AprobarPermisos;