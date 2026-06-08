import { useEffect } from "react";
import ListaProcesarPermisos from "../components/ListaProcesarPermisos";
import NavbarEmpresa from "../components/NavbarEmpresa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string;
  descontable: boolean;
  descripcion: string;
  ci: string;
  nombres: string;
  apellidos: string;
  departamento: string;
  cargo: string;
}

function ProcesarPermisos() {
  const { RRHH } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (RRHH !== 1) {
      navigate('/home');
    }
  }, [RRHH, navigate]);

  return (
    <>
      <NavbarEmpresa />
      <div className="canvas">
        <h1>Procesar Permisos</h1>
        <ListaProcesarPermisos />
      </div>
    </>
  );
}

export default ProcesarPermisos;
