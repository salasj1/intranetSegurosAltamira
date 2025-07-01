import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../css/NavbarEmpresa.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faBell } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../auth/AuthProvider';
import logoEmpresa from '../assets/logo-head.png';
library.add(fas, faBell);
import Notificaciones from './Notificaciones.tsx'; // Importar el nuevo componente
import { Row, Col, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState } from 'react';
import '../css/Hamburguesa.css';
import { Link } from 'react-router-dom';
function NavbarEmpresa() {
    const auth = useAuth();

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogout = () => {
        auth.logout();
        <Navigate to='/' />;
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isSolicitudesActive = () => {
        const path = location.pathname;
        const activePaths = [
            '/SolicitarVacaciones',
            '/AprobarVacaciones',
            '/ProcesarVacaciones',
            '/RetornoVacaciones',
            '/SolicitarPermisos',
            '/AprobarPermisos',
            '/ProcesarPermisos'
        ];
        return activePaths.some(activePath => path.startsWith(activePath));
    };

    const isConsultasActive = () => {
        const path = location.pathname;
        const activePaths = [
            '/RecibodePago',
            '/Prestaciones',
            '/ARC',
            '/ConstanciaDeTrabajo'
        ];
        return activePaths.some(activePath => path.startsWith(activePath));
    };

    return (
        <>
   
                <Navbar bg='light' data-bs-theme='light' id='Navegador' className='NavbarEmpresa'>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '70%', width: 'auto' }}>
                        <Navbar.Brand className='imagenEmpresa'>
                            <Link to="/home">
                                <img className='logo' src={logoEmpresa} alt='Logo Empresa' />
                            </Link>
                        </Navbar.Brand>

                        <Button variant='primary' className='d-lg-none abrir-boton' onClick={handleShow}>
                            <div className="icon nav-icon-3">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </Button>
                    </div>

                    <Offcanvas show={show} onHide={handleClose} responsive='lg'>
                        <Offcanvas.Header closeButton className='offcanvas-header'>
                            <Nav className='right-div'>
                                <div className='user-info'>{auth.nombre_completo?.replace(/,/g, '') || 'Nombre completo'}</div>
                                <div className='user-info'>{auth.cargo_empleado || 'Cargo del Empleado'}</div>
                                <Navbar.Brand>
                                    <Notificaciones />
                                </Navbar.Brand>
                            </Nav>
                        </Offcanvas.Header>
                        <Offcanvas.Body>
                            <Container>
                                <Row>
                                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                                    <Navbar.Collapse id='responsive-navbar-nav'>
                                        <Nav className='me-auto'>
                                            <Col>
                                                <NavDropdown title='Consultas' className={isConsultasActive() ? 'nav-dropdown-active' : ''}>
                                                    <NavDropdown.Item as={Link} to='/RecibodePago' className='cuadroItem'>
                                                        Recibo de pago
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to='/Prestaciones' className='cuadroItem'>
                                                        Prestaciones Sociales
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to="/ConstanciaDeTrabajo" className='cuadroItem'>
                                                        Constancia de Trabajo
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to='/ARC' className='cuadroItem'>
                                                        Comprobante de Agente de Retención (ARC)
                                                    </NavDropdown.Item>
                                                </NavDropdown>
                                            </Col>

                                            <Col>
                                                <NavDropdown title='Procesos' className={isSolicitudesActive() ? 'nav-dropdown-active' : ''}>
                                                    <NavDropdown title='Pago de Vacaciones' id='submenu' className={isSolicitudesActive() ? 'cuadroItem cuadroSubmenu show' : 'cuadroItem cuadroSubmenu'} drop='end'>
                                                        <NavDropdown.Item as={Link} to='/SolicitarVacaciones' className='cuadroItem'>
                                                            Solicitar
                                                        </NavDropdown.Item>
                                                        {auth.tipo === 'Supervisor' || auth.RRHH === 1 ? (
                                                            <NavDropdown.Item as={Link} to='/AprobarVacaciones' className='cuadroItem'>
                                                                Aprobar
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                        {auth.RRHH === 1 ? (<>
                                                            <NavDropdown.Item as={Link} to='/ProcesarVacaciones' className='cuadroItem'>
                                                                Procesar
                                                            </NavDropdown.Item>
                                                            
                                                        </>
                                                        ) : null}
                                                    </NavDropdown>
                                                    <NavDropdown title='Permisos o Disfrute' id='submenu' className={isSolicitudesActive() ? 'cuadroItem cuadroSubmenu show' : 'cuadroItem cuadroSubmenu'} drop='end' style={{ width: "100%" }}>
                                                        <NavDropdown.Item as={Link} to='/SolicitarPermisos' className='cuadroItem'>
                                                            Solicitar Permisos/ Vacaciones no Disfrutados
                                                        </NavDropdown.Item>
                                                        {auth.tipo === 'Supervisor' || auth.RRHH === 1 ? (
                                                            <NavDropdown.Item as={Link} to='/AprobarPermisos' className='cuadroItem'>
                                                                Aprobar Permisos
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                        {auth.RRHH === 1 ? (
                                                            <NavDropdown.Item as={Link} to='/ProcesarPermisos' className='cuadroItem'>
                                                                Procesar Permisos
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                    </NavDropdown>
                                                    <NavDropdown title='Expediente' id='submenu' className={isActive('/Expediente') ? 'cuadroItem cuadroSubmenu show' : 'cuadroItem cuadroSubmenu'} drop='end'>
                                                        <NavDropdown.Item as={Link} to='/Expediente' className='cuadroItem'>
                                                            Ver Expediente
                                                        </NavDropdown.Item>
                                                        {auth.RRHH === 1 ? (
                                                            <NavDropdown.Item as={Link} to='/GestionExpediente' className='cuadroItem'>
                                                                Administrar Expediente
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                    </NavDropdown>
                                                </NavDropdown>
                                            </Col>

                                            <Col>
                                                <Nav.Link as={Link} to='/DirectorioEmpleados' className={isActive('/DirectorioEmpleados') ? 'active textoNavlink' : 'textoNavlink'}>
                                                    Directorio de Empleados
                                                </Nav.Link>
                                            </Col>
                                            {auth.RRHH === 1 ? (
                                                <Col>
                                                    <Nav.Link as={Link} to='/ControlSupervision' className={isActive('/ControlSupervision') ? 'active textoNavlink' : 'textoNavlink'}>
                                                        Control de Supervisión
                                                    </Nav.Link>
                                                </Col>
                                            ) : null}

                                            <Col md={auth.RRHH === 1 ? { offset: 4 } : { offset: 6 }}>
                                                <Nav className='right-div'>
                                                    <div className="contenedor-user-info">
                                                        <div className='user-info'>{auth.nombre_completo?.replace(/,/g, '') || 'Nombre completo'}</div>
                                                        <div className='user-info'>{auth.cargo_empleado || 'Cargo del Empleado'}</div>
                                                        <Navbar.Brand>
                                                            <Notificaciones />
                                                        </Navbar.Brand>
                                                    </div>
                                                    <Nav.Link onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                                                </Nav>
                                            </Col>
                                        </Nav>
                                    </Navbar.Collapse>
                                </Row>
                            </Container>
                        </Offcanvas.Body>
                    </Offcanvas>
                </Navbar>
        
        </>
    );
}

export default NavbarEmpresa;