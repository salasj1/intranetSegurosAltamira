import { Alert, Modal } from 'react-bootstrap';
import { useEffect, useState } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

interface EliminarSupervisionModalProps {
    show: boolean;
    cod_supervisor: string;
    cod_emp: string;
    handleClose: () => void;
    handleDelete: (ID_SUPERVISION: number) => void;
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

const ModalDeleteSupervisor: React.FC<EliminarSupervisionModalProps> = ({ cod_emp, cod_supervisor, show, handleClose, handleDelete }) => {
    const [supervision, setSupervision] = useState<Supervisión | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSupervision = async () => {
            console.log(cod_emp, cod_supervisor);
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
                console.log(data);
                setSupervision(data);
            } catch (error) {
                console.error('Error fetching supervision:', error);
                setError('Error al cargar los datos de la supervision');
            }
        };
        fetchSupervision();
    }, [cod_emp, cod_supervisor]);

    const handleConfirmDelete = async () => {
        try {
            if (supervision) {
                handleDelete(supervision.ID_SUPERVISION);
            }
            handleClose();
            
        } catch (error) {
            console.error('Error deleting supervision:', error);
            setError('Error al eliminar la supervision');
        }
    };

    return (
        <Modal show={show} onHide={handleClose} autoFocus={true} centered>
            <Modal.Header closeButton>
                <Modal.Title>Eliminar Supervisión</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                
                  <Alert variant="secondary">
                    <h3>Supervisor</h3>
                    <p> <strong>Cédula: </strong>{supervision?.cedula_supervisor}</p>
                    <p><strong>Nombre: </strong>{supervision?.nombre_supervisor}</p>
                    <p><strong>Departamento: </strong>{supervision?.departamento_supervisor}</p>
                    <p><strong>Cargo: </strong>{supervision?.cargo_supervisor}</p>
                    <hr />
                    <h3>Supervisado</h3>
                    <p><strong>Cédula: </strong>{supervision?.cedula_empleado}</p>
                    <p><strong>Nombre: </strong>{supervision?.nombre_empleado}</p>
                    <p><strong>Departamento: </strong>{supervision?.departamento_empleado}</p>
                    <p><strong>Cargo: </strong>{supervision?.cargo_empleado}</p>
                    <hr />
                    <div className='display-flex flex-column '>
                    <h4>Tipo de Supervisión: {supervision?.Tipo}</h4>
                    </div>   
                </Alert>
                <Alert variant="danger">
                    <h5>¿Está seguro que desea eliminar esta supervisión?</h5>
                </Alert>
               
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <button className="btn btn-secondary" onClick={handleClose}>Cancelar</button>   
                    <button className="btn btn-danger" onClick={handleConfirmDelete}>Eliminar Supervisión</button>
                </div>
            </Modal.Body>
        </Modal>
    );
}

export default ModalDeleteSupervisor;