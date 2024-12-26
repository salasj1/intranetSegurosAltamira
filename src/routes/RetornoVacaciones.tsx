import { useEffect, useState } from "react";
import { GrCircleAlert } from "react-icons/gr";
import ListaRetornoDiasVacaciones from "../components/ListaRetornoDiasVacaciones";
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
    FechaRetorno: Date;
    cod_emp: string;
    cedula: string;
    nombre_empleado: string;
    nombres_empleado: string;
    apellidos_empleado: string;
    departamento: string;
    cargo: string;
}

function ProcesarVacaciones() {
    
    const [vacaciones, setVacaciones] = useState<Vacacion[]>([]);
    const [error, setError] = useState<string | null>(null);
    const {cod_emp,  RRHH } = useAuth();
    
    const navigate = useNavigate();
    useEffect(() => {
        if (RRHH !== 1 ) {
        navigate('/home'); 
        }
    }, [RRHH,  navigate]);
    const fetchVacaciones = async () => {
        try {
            const response = await axios.get(`${apiUrl}/vacaciones/vacacionesProcesadas/${cod_emp}`);
            console.log(response.data);
            setVacaciones(response.data);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error fetching vacaciones:', error.message);
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
                <h1>Retorno de Vacaciones</h1>
                {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    <AlertHeading>Error <hr /></AlertHeading>{error}
                </Alert>}
                <br/>
                <div style={{ textAlign: "justify" , marginLeft: "-600px"}}>
                    <Alert variant="info" dismissible style={{display: 'flex', flexDirection: 'row', gap:'10px'}}>
                    <GrCircleAlert size={60}/>
                    <div style={{fontSize: '18px'}}>
                    <h2>Información</h2>
                    <p>Esta sección es cuando un empleado regresa de vacaciones antes de lo previsto.</p>
                    <p> Busque las vacaciones que desea y coloque las fechas de retorno de ese trabajador.</p>
                    </div>
                    </Alert>
                </div>
                <ListaRetornoDiasVacaciones vacaciones={vacaciones} fetchVacaciones={fetchVacaciones} />
            </div>
        </>
    );
}

export default ProcesarVacaciones;