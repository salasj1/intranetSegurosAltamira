import { useEffect, useState } from "react";
import ListaProcesarPermisos from "../components/ListaProcesarPermisos";
import NavbarEmpresa from "../components/NavbarEmpresa";

import axios from "axios";

function ProcesarPermisos() {
  const [permisos, setPermisos] = useState([]);

  const fetchPermisos = async () => {
    try {
      const response = await axios.get(`/api/permisos/aprobadosProcesados`);
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
      
      <div className="container">
        <br />
        <br />
        <br />
        <br />
        <br />
        <h1>Procesar Permisos</h1>
        <br />
        <br />
        <ListaProcesarPermisos permisos={permisos} fetchPermisos={fetchPermisos} />
      </div>
    </>
  );
}

export default ProcesarPermisos;