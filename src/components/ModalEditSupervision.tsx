import { Alert, FormControl, Modal} from 'react-bootstrap';
import { useEffect, useState } from 'react';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

interface EditarSupervisionModalProps {
    show: boolean;
    cod_supervisor: string;
    cod_emp: string;
    handleClose: () => void;
    handleEdit: (ID_SUPERVISION: number, Tipo: string) => void;
}

interface Supervisión {
    ID_SUPERVISION: number;
    cod_emp: string;
    cedula_empleado: string;
    nombre_empleado: string;
    departamento_empleado: string;
    cargo_empleado: string;
    cod_supervisor: string;
    cedula_supervisor: string;
    nombre_supervisor: string;
    departamento_supervisor: string;
    cargo_supervisor: string;
    Tipo: string;
}

interface TipoSupervision {
    tipo: number;
    nombre: string;
  }

  const ModalEditSupervision: React.FC<EditarSupervisionModalProps> = ({ cod_emp, cod_supervisor, show, handleClose, handleEdit }) => {
    const [supervision, setSupervision] = useState<Supervisión | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tipo_supervision, setTipo_supervision] = useState<string>('');
    const [opcionestiposSupervision, setOpcionesTiposSupervision] = useState<TipoSupervision[]>([]);

    useEffect(() => {
        const fetchSupervision = async () => {
            try {
                const response = await fetch(`${apiUrl}/empleados/supervision?cod_emp=${cod_emp}&cod_supervisor=${cod_supervisor}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                if (!response.ok) {
                    throw new Error('Error al obtener los datos de la supervisión');
                }

                const text = await response.text();
                if (!text) {
                    throw new Error('Respuesta vacía del servidor');
                }

                const data = JSON.parse(text);
                
                setSupervision(data);
                setTipo_supervision(data.Tipo);
            } catch (error) {
                console.error('Error fetching supervision:', error);
                setError('Error al cargar los datos de la supervision');
            }
        };

        const fetchTiposSupervision = async () => {
            try {
              const response = await axios.get(`${apiUrl}/empleados/tipos-supervision`);
              setOpcionesTiposSupervision(response.data);
            } catch (error) {
              console.error('Error fetching tipos de supervision:', error);
            }
          };

        fetchSupervision();
        fetchTiposSupervision();
    }, [cod_emp, cod_supervisor]);

    const handleSave = async () => {
        try {
            console.log("Tipo Supervision: ", tipo_supervision);
            await handleEdit(supervision?.ID_SUPERVISION || 0, tipo_supervision || '');
            handleClose();
        } catch (error) {
            console.error('Error saving supervision:', error);
            setError('Error al guardar los cambios de la supervision');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} autoFocus={true} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Supervisión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                <Alert variant="primary">
                    <h3>Supervisor</h3>
                    <p><strong>Cédula: </strong>{supervision?.cedula_supervisor.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
                    <p><strong>Nombre: </strong>{supervision?.nombre_supervisor}</p>
                    <p><strong>Departamento: </strong>{supervision?.departamento_supervisor}</p>
                    <p><strong>Cargo: </strong>{supervision?.cargo_supervisor}</p>
                </Alert>
                <Alert variant="primary">
                    <h3>Supervisado</h3>
                    <p><strong>Cédula: </strong>{supervision?.cedula_empleado.replace(/\B(?=(\d{3})+(?!\d))/g, ".")}</p>
                    <p><strong>Nombre: </strong>{supervision?.nombre_empleado}</p>
                    <p><strong>Departamento: </strong>{supervision?.departamento_empleado}</p>
                    <p><strong>Cargo: </strong>{supervision?.cargo_empleado}</p>
                </Alert>
                <Alert variant="warning">
                    <p><h3>Tipo</h3></p>
                    <FormControl
                        as="select"
                        value={tipo_supervision}
                        onChange={(e) => setTipo_supervision(e.target.value)}
                    >
                        <option value={"0"}>Seleccione un tipo</option>
                        {opcionestiposSupervision.map((tipo) => (
                            <option key={tipo.tipo} value={tipo.tipo.toString()}>{tipo.nombre}</option>
                        ))}
                    </FormControl>
                </Alert>
               
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>   
                    <button className="btn btn-primary" onClick={handleSave}>Editar Supervisión</button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalEditSupervision;