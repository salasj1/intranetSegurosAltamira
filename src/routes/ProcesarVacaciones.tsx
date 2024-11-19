import { useEffect, useState } from "react";

import ListaProcesarVacacaciones from "../components/ListaProcesarVacaciones";
import NavbarEmpresa from "../components/NavbarEmpresa";
import axios from "axios";
import { Alert, AlertHeading } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthProvider";

const apiUrl = import.meta.env.VITE_API_URL;
export interface Vacacion {
    VacacionID: number;
    FechaInicio: Date;
    FechaFin: Date;
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
}

function ProcesarVacaciones() {
    
    const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const {  RRHH } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (RRHH !== 1 ) {
        navigate('/home'); 
        }
    }, [RRHH,  navigate]);
    const fetchVacaciones = async () => {
        try {
            const response = await axios.get(`${apiUrl}/vacacionesaprobadas`);
            console.log(response.data);
            setVacaciones(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching vacaciones:', error.message);
                if (error.response) {
                    console.error('Response data:', error.response.data);
                    console.error('Response status:', error.response.status);
                    console.error('Response headers:', error.response.headers);
                } else if (error.request) {
                    console.error('Request data:', error.request);
                } else {
                    console.error('Error message:', error.message);
                }
            } else {
                console.error('Error:', error);
            }
            setError('Error al cargar los datos de las vacaciones');
        }
    };

    useEffect(() => {
        fetchVacaciones();
    }, []);

    return (
        <>
            <NavbarEmpresa />
            <div className="canvas">
                <h1>Procesar Vacaciones</h1>
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <AlertHeading>Error <hr /></AlertHeading>{error}
                </Alert>}
                <ListaProcesarVacacaciones vacaciones={vacaciones} fetchVacaciones={fetchVacaciones} />
            </div>
        </>
    );
}

export default ProcesarVacaciones;