import { useEffect } from "react";
import ListaProcesarVacacaciones from "../components/ListaProcesarVacaciones";
import NavbarEmpresa from "../components/NavbarEmpresa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

export interface Vacacion {
    VacacionID: number;
    diasDisfrutar: number;
    diasPagar: number;
    FechaInicio: Date;
    FechaFin: Date;
    FechaRetorno: Date;
    Estado: string;
    cod_emp: string;
    nombre_empleado: string;
    nombres_empleado: string;
    apellidos_empleado: string;
    cod_supervisor: string;
    nombre_supervisor: string;
    nombres_supervisor: string;
    apellidos_supervisor: string;
    ci: string;
    departamento: string;
    cargo: string;
    labelPeriodo: string | null;
}

function ProcesarVacaciones() {
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
                <h1>Procesar Vacaciones</h1>
                <ListaProcesarVacacaciones />
            </div>
        </>
    );
}

export default ProcesarVacaciones;
