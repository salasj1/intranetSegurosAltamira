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

function NavbarEmpresa() {
    const auth = useAuth();
    const handleLogout = () => {
        auth.logout();
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isVacacionesActive = () => {
        const path = location.pathname;
        return path.startsWith('/SolicitarVacaciones') || path.startsWith('/AprobarVacaciones') || path.startsWith('/ProcesarVacaciones') ;
    };
    
    const isPermisosActive = () => {
        const path = location.pathname;
        return path.startsWith('/SolicitarPermisos') || path.startsWith('/AprobarPermisos') || path.startsWith('/ProcesarPermisos') ;
    };

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
                                    <Navbar.Brand href="/notificaciones">
                                        <FontAwesomeIcon icon={["fas", "bell"]} style={{ color: "#ff7b00" }} />
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