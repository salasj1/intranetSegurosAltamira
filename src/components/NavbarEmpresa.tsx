import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../css/NavbarEmpresa.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../auth/AuthProvider';
import logoEmpresa from '../assets/logo-head.png';
library.add(fas, faBell);
import Hamburguesa from './Hamburguesa.tsx';
import { useEffect, useState } from 'react';
import { Button, ListGroup, ListGroupItem, Toast } from 'react-bootstrap';
import axios from 'axios';
import img1 from '../assets/icono.webp';

function NavbarEmpresa() {
    const [showPermisos, setShowPermisos] = useState(false);
    const auth = useAuth();
    interface Permiso {
        Titulo: string;
        Estado: string;
        nombres: string;
        apellidos: string;
        cod_emp: string;
    }

    const [newPermisos, setNewPermisos] = useState<Permiso[]>([]);

    const handleLogout = () => {
        auth.logout();
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isVacacionesActive = () => {
        const path = location.pathname;
        return path.startsWith('/SolicitarVacaciones') || path.startsWith('/AprobarVacaciones') || path.startsWith('/ProcesarVacaciones');
    };

    const isPermisosActive = () => {
        const path = location.pathname;
        return path.startsWith('/SolicitarPermisos') || path.startsWith('/AprobarPermisos') || path.startsWith('/ProcesarPermisos');
    };

    const fetchNewPermisos = async () => {
        try {
            let response;
            if (auth.tipo === 'Supervisor') {
                response = await axios.get(`/api/permisos/notificacion/Supervisor/${auth.cod_emp}`);
            } 
            console.log(auth.RRHH);
            if(auth.RRHH === 1) {
                response = await axios.get(`/api/permisos/nuevos/${auth.cod_emp}`);
            
                
            } else if (auth.RRHH === 0 && auth.tipo === 'Empleado') {
                response = await axios.get(`/api/permisos/${auth.cod_emp}`);
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

    return (
        <>
            <div className='NavbarEmpresa'>
                <Navbar bg="light" data-bs-theme="light" id="Navegador">
                    <Navbar.Brand className='imagenEmpresa' href="/home">
                        <img src={logoEmpresa} alt="Logo Empresa" />
                    </Navbar.Brand>
                    <Container>
                        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                        <Navbar.Collapse id="responsive-navbar-nav">
                            <Nav className="me-auto">
                                <Nav.Link href="/RecibodePago" className={isActive('/RecibodePago') ? 'active' : ''}>Recibo de pago</Nav.Link>
                                <Nav.Link href="/Prestaciones" className={isActive('/Prestaciones') ? 'active textoNavlink' : 'textoNavlink'}>Movimientos de Prestaciones Sociales</Nav.Link>
                                <NavDropdown title="Vacaciones" id="navbarScrollingDropdown" className={isVacacionesActive() ? 'nav-dropdown-active' : ''}>
                                    <NavDropdown.Item href="/SolicitarVacaciones" className='cuadroItem'>Solicitar Vacaciones</NavDropdown.Item>
                                    {auth.tipo === 'Supervisor' || auth.RRHH === 1 ? (
                                        <NavDropdown.Item href="/AprobarVacaciones" className='cuadroItem'>Aprobar Vacaciones</NavDropdown.Item>
                                    ) : null}
                                    {auth.RRHH === 1 ? (
                                        <NavDropdown.Item href="/ProcesarVacaciones" className='cuadroItem'>Procesar Vacaciones</NavDropdown.Item>
                                    ) : null}
                                </NavDropdown>
                                <NavDropdown title="Permisos" id="navbarScrollingDropdown" className={isPermisosActive() ? 'nav-dropdown-active' : ''}>
                                    <NavDropdown.Item href="/SolicitarPermisos" className='cuadroItem'>Solicitar Permisos</NavDropdown.Item>
                                    {auth.tipo === 'Supervisor' || auth.RRHH === 1 ? (
                                        <NavDropdown.Item href="/AprobarPermisos" className='cuadroItem'>Aprobar Permisos</NavDropdown.Item>
                                    ) : null}
                                    {auth.RRHH === 1 ? (
                                        <NavDropdown.Item href="/ProcesarPermisos" className='cuadroItem'>Procesar Permisos</NavDropdown.Item>
                                    ) : null}
                                </NavDropdown>
                                <Nav.Link href="/ARC" className={isActive('/ARC') ? 'active ' : ''}>ARC</Nav.Link>
                                <Nav.Link href="/DirectorioEmpleados" className={isActive('/DirectorioEmpleados') ? 'active' : ''}>Directorio de Empleados</Nav.Link>
                                <Nav className="right-div">
                                    <div className="user-info">{auth.nombre_completo || 'Nombre completo'}</div>
                                    <div className="user-info">{auth.cargo_empleado || 'Cargo del Empleado'}</div>
                                    <Navbar.Brand>
                                        <Button variant='light' onClick={() => setShowPermisos(!showPermisos)} className="mb-2">
                                            <FontAwesomeIcon icon={["fas", "bell"]} style={{ color: "#ff7b00" }} />
                                        </Button>
                                        {showPermisos && (
                                            <div className="permisos-lista" >
                                                <ListGroup className='Notificaciones'>
                                                    {newPermisos.length === 0 ? (
                                                        <ListGroupItem>
                                                            <h5 style={{color:"white"}}>No hay notificaciones que mostrar</h5>
                                                        </ListGroupItem>
                                                    ) : (
                                                        <>
                                                            {newPermisos.map((permiso, index) => (
                                                                ((auth.tipo === "Supervisor") && permiso.Estado==="Pendiente") && (
                                                                    <ListGroup.Item key={index}>
                                                                        <Toast className='notificacion'>
                                                                            <Toast.Header closeButton={false}>
                                                                                <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                                                <strong className="me-auto">{permiso.nombres + " " + permiso.apellidos}</strong>
                                                                                
                                                                            </Toast.Header>
                                                                            <Toast.Body >
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
                                                            {newPermisos.map((permiso, index) => (
                                                                (auth.RRHH === 1 && permiso.Estado==="Aprobada") && (
                                                                    <ListGroup.Item key={index}>
                                                                        <Toast className='notificacion'>
                                                                            <Toast.Header closeButton={false}>
                                                                                <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                                                <strong className="me-auto">{permiso.nombres + " " + permiso.apellidos}</strong>
                                                                                
                                                                            </Toast.Header>
                                                                            <Toast.Body >
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
                                                            {newPermisos.map((permiso, index) => (
                                                                (auth.cod_emp === permiso.cod_emp && (permiso.Estado === "Aprobada" || permiso.Estado === "Rechazada" || permiso.Estado === "Procesado")) && (
                                                                    <ListGroup.Item key={index}>
                                                                        <Toast className='notificacion'>
                                                                            <Toast.Header closeButton={false}>
                                                                                <img src={img1} className="rounded me-2" alt="" style={{ width: "20px" }} />
                                                                                <strong className="me-auto">Solicitud de Permiso</strong>
                                                                                
                                                                            </Toast.Header>
                                                                            <Toast.Body >
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
                                    </Navbar.Brand>
                                    <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                                </Nav>
                            </Nav>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </div>
        </>
    );
}

export default NavbarEmpresa;