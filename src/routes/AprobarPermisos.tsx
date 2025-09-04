import  { useState, useEffect } from 'react';
import NavbarEmpresa from '../components/NavbarEmpresa';
import ListaAprobacionPermisos from '../components/ListaAprobacionPermisos';
import axios from 'axios'; 
import { useAuth } from '../auth/AuthProvider';
import { useNavigate } from "react-router-dom";

const apiUrl = import.meta.env.VITE_API_URL;

function AprobarPermisos() {
  const [permisos, setPermisos] = useState([]);
  const { cod_emp, tipo, RRHH } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (RRHH !== 1 && tipo !== 'Supervisor') {
      navigate('/home'); // Redirigir a la página de inicio si no tiene permisos
    }
  }, [RRHH, tipo, navigate]);
  const fetchPermisos = async () => {
    try {
      const response = await axios.get(`${apiUrl}/permisos/supervisor/${cod_emp}`);
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