import { useEffect, useState } from "react";
import ListaProcesarPermisos from "../components/ListaProcesarPermisos";
import NavbarEmpresa from "../components/NavbarEmpresa";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";
function ProcesarPermisos() {
  const [permisos, setPermisos] = useState([]);
  const {  RRHH } = useAuth();
  const navigate = useNavigate();
    useEffect(() => {
        if (RRHH !== 1 ) {
        navigate('/home'); // Redirigir a la página de inicio si no tiene permisos
        }
    }, [RRHH,  navigate]);
  const fetchPermisos = async () => {
    try {
      const response = await axios.get(`/api/permisos/aprobadosProcesados`);
      console.log('Permisos recibidos:', response.data); // Verificar los datos recibidos
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
        <h1>Procesar Permisos</h1>
        <ListaProcesarPermisos permisos={permisos} fetchPermisos={fetchPermisos} />
      </div>
    </>
  );
}

export default ProcesarPermisos;