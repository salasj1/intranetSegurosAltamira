import React, { useEffect, useState } from 'react';
import { Badge, Button, ListGroup, ListGroupItem, Toast } from 'react-bootstrap';
import img1 from '../assets/icono.webp';
import { useAuth } from '../auth/AuthProvider';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';

interface Permiso {
    PermisosID: number;
    Titulo: string;
    Estado: string;
    nombres: string;
    apellidos: string;
    cod_emp: string;
}

interface DiscardedPermiso {
    PermisosID: number;
    Estado: string;
}

const Notificaciones: React.FC = () => {
    const [showPermisos, setShowPermisos] = useState(false);
    const [discardedPermisos, setDiscardedPermisos] = useState<DiscardedPermiso[]>([]);
    const [newPermisos, setNewPermisos] = useState<Permiso[]>([]);
    const [notificationCount, setNotificationCount] = useState<number>(0);
    const auth = useAuth();

    const fetchNewPermisos = async () => {
        try {
            let response;
            if (auth.tipo === 'Supervisor') {
                response = await axios.get(`/api/permisos/notificacion/Supervisor/${auth.cod_emp}`);
            } 
            if(auth.RRHH === 1) {
                response = await axios.get(`/api/permisos/nuevos/${auth.cod_emp}`);
            } else if (auth.RRHH === 0 && auth.tipo === 'Empleado') {
                response = await axios.get(`/api/permisos/id/${auth.cod_emp}`);
            }
            if (response && Array.isArray(response.data)) {
                setNewPermisos(response.data);
            } else {
                setNewPermisos([]);
            }
        } catch (error) {
            console.error('Error al obtener permisos nuevos:', error);
            setNewPermisos([]);
        }
    };

    useEffect(() => {
        if (showPermisos) {
            fetchNewPermisos();
        }
    }, [showPermisos]);

    useEffect(() => {
        const storedDiscardedPermisos = localStorage.getItem('discardedPermisos');
        if (storedDiscardedPermisos) {
            setDiscardedPermisos(JSON.parse(storedDiscardedPermisos));
        }
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchNewPermisos();
        }, 60000); // 1 minuto

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const filteredPermisos = newPermisos.filter(permiso => {
            const discarded = discardedPermisos.find(d => d.PermisosID === permiso.PermisosID);
            return !discarded || discarded.Estado !== permiso.Estado;
        });
        setNotificationCount(filteredPermisos.length);
    }, [newPermisos, discardedPermisos]);

    const handleDiscard = (PermisosID: number, Estado: string) => {
        setDiscardedPermisos(prev => {
            const updated = [...prev, { PermisosID, Estado }];
            localStorage.setItem('discardedPermisos', JSON.stringify(updated));
            return updated;
        });
    };

    const filteredPermisos = newPermisos.filter(permiso => {
        const discarded = discardedPermisos.find(d => d.PermisosID === permiso.PermisosID);
        return !discarded || discarded.Estado !== permiso.Estado;
    });

    return (
        <>
            <Button variant='light' onClick={() => setShowPermisos(!showPermisos)} className="mb-2" style={{height:"50px"}}>
                <FontAwesomeIcon icon={["fas", "bell"]} style={{ color: "#ff7b00", height:"30px"}} />
                <h6 style={{position:"relative",top:"-42px", left:"16px"}}>
                    {notificationCount > 0 && (
                        <Badge pill bg="primary">
                            {notificationCount}
                        </Badge>
                    )}
                </h6>
            </Button>
            {showPermisos && (
                <div className="permisos-lista">
                    <ListGroup className='Notificaciones'>
                        {filteredPermisos.length === 0 ? (
                            <ListGroupItem>
                                <h5 style={{color:"white"}}>No hay notificaciones que mostrar</h5>
                            </ListGroupItem>
                        ) : (
                            <>
                                {filteredPermisos.map((permiso, index) => (
                                    ((auth.tipo === "Supervisor") && permiso.Estado==="Pendiente") && (
                                        <ListGroup.Item key={index}>
                                            <Toast className='notificacion' onClose={() => handleDiscard(permiso.PermisosID, permiso.Estado)}>
                                                <Toast.Header closeButton={true}>
                                                    <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                    <strong className="me-auto">{permiso.nombres + " " + permiso.apellidos}</strong>
                                                </Toast.Header>
                                                <Toast.Body>
                                                    <div className="BodyItem">
                                                        Hay un permiso por aprobar:
                                                        <br />
                                                        <strong>{permiso.Titulo}</strong>
                                                    </div>
                                                </Toast.Body>
                                            </Toast>
                                        </ListGroup.Item>
                                    )
                                ))}
                                {filteredPermisos.map((permiso, index) => (
                                    (auth.RRHH === 1 && permiso.Estado==="Aprobada") && (
                                        <ListGroup.Item key={index}>
                                            <Toast className='notificacion' onClose={() => handleDiscard(permiso.PermisosID, permiso.Estado)}>
                                                <Toast.Header closeButton={true}>
                                                    <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                    <strong className="me-auto">{permiso.nombres + " " + permiso.apellidos}</strong>
                                                </Toast.Header>
                                                <Toast.Body>
                                                    <div className="BodyItem">
                                                        Hay un permiso por procesar:
                                                        <br />
                                                        <strong>{permiso.Titulo}</strong>
                                                    </div>
                                                </Toast.Body>
                                            </Toast>
                                        </ListGroup.Item>
                                    )
                                ))}
                                {filteredPermisos.map((permiso, index) => (
                                    ( auth.cod_emp === permiso.cod_emp && (permiso.Estado === "Aprobada" || permiso.Estado === "Rechazada" || permiso.Estado === "Procesada")) && (
                                        <ListGroup.Item key={index}>
                                            <Toast className='notificacion' onClose={() => handleDiscard(permiso.PermisosID, permiso.Estado)}>
                                                <Toast.Header closeButton={true}>
                                                    <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                    <strong className="me-auto">Solicitud de Permiso</strong>
                                                </Toast.Header>
                                                <Toast.Body>
                                                    <div className="BodyItem">
                                                        {permiso.Estado === "Aprobada" ? "La solicitud del Permiso ha sido Aprobada" :
                                                            permiso.Estado === "Rechazada" ? "La solicitud del Permiso ha sido Rechazada" :
                                                                "La solicitud ya ha sido Procesada"}
                                                        <br />
                                                        <strong>{permiso.Titulo}</strong>
                                                    </div>
                                                </Toast.Body>
                                            </Toast>
                                        </ListGroup.Item>
                                    )
                                ))}
                            </>
                        )}
                    </ListGroup>
                </div>
            )}
        </>
    );
};

export default Notificaciones;