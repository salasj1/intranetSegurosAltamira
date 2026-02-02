import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../css/NavbarEmpresa.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas, faBell } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../auth/AuthProvider';
import logoEmpresa from '../assets/webp/logo-login.webp';
library.add(fas, faBell);
import { Row, Col, Button } from 'react-bootstrap';
import { Navigate } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import { useState, useRef } from 'react';
import '../css/Hamburguesa.css';
import { Link } from 'react-router-dom';

function NavbarEmpresa() {
    const auth = useAuth();

    const lastUpdateRef = useRef<number>(0);

    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    const handleLogout = () => {
        auth.logout();
        <Navigate to='/' />;
    };

    const isActive = (path: string) => location.pathname.startsWith(path);
    const isVacacionesActive = () => {
        const path = location.pathname;
        const activePaths = [
            '/SolicitarVacaciones',
            '/AprobarVacaciones',
            '/ProcesarVacaciones',
            '/RetornoVacaciones'
        ];
        return activePaths.some(activePath => path.startsWith(activePath));
    };
    const isPermisosActive =() => {
        const path = location.pathname;
        const activePaths = [
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
   
    const isExpedienteActive = () => {
        const path = location.pathname;
        const expedienteBase = '/expediente';
        const activePaths = [
            expedienteBase,
            `${expedienteBase}/datos`,
            `${expedienteBase}/rutograma`,
            `${expedienteBase}/documentos`,
            '/GestionExpediente'
        ];
        return activePaths.some(activePath => path.startsWith(activePath));
    };

    // Nueva función para manejar el toggle de los dropdowns de procesos
    const handleProcessDropdownToggle = (isOpen: boolean) => {
        // Solo re-validamos cuando el menú se está abriendo
        if (isOpen) {
            const now = Date.now();
            // Verifica si ha pasado al menos 1 minuto (60000 ms) desde la última actualización
            if (now - lastUpdateRef.current >= 60000) {
                auth.revalidateUserStatus();
                lastUpdateRef.current = now;
            }
        }
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

                    <Offcanvas show={show} onHide={handleClose} responsive='lg'  id='row-navbar'>
                        <Offcanvas.Header closeButton className='offcanvas-header' style={{marginLeft:0}}>
                            <Nav className='right-div'>
                                <div className='user-info'>{auth.nombre_completo?.replace(/,/g, '') || 'Nombre completo'}</div>
                                <div className='user-info'>{auth.cargo_empleado || 'Cargo del Empleado'}</div>
                            </Nav>
                        </Offcanvas.Header>
                        <Offcanvas.Body>

                                <Row id='row-navbar'>
                                    <Navbar.Toggle aria-controls='responsive-navbar-nav' />
                                    <Navbar.Collapse id='responsive-navbar-nav'>
                                        <Nav className='me-auto'>
                                            <div className='lista-Opciones-Nav'>

                                            
                                            <Col>
                                                <NavDropdown title='Consultas' className={isConsultasActive() ? 'nav-dropdown-active' : ''}>
                                                    <NavDropdown.Item as={Link} to='/RecibodePago'  id='submenu' className={isActive('/RecibodePago') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                        Recibo de pago
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to='/Prestaciones' id='submenu'  className={isActive('/Prestaciones') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                        Prestaciones Sociales
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to="/ConstanciaDeTrabajo" id='submenu' className={isActive('/ConstanciaDeTrabajo') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                        Constancia de Trabajo
                                                    </NavDropdown.Item>
                                                    <NavDropdown.Item as={Link} to='/ARC' id='submenu' className={isActive('/ARC') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                        Comprobante de Agente de Retención (ARC)
                                                    </NavDropdown.Item>
                                                </NavDropdown>
                                            </Col>

                                            <Col>
                                                <NavDropdown title='Procesos' className={(isVacacionesActive() || isPermisosActive() || isExpedienteActive()) ? 'nav-dropdown-active' : ''}>
                                                    {/* Modifica este NavDropdown */}
                                                    <NavDropdown 
                                                        title='Vacaciones (Pago y Disfrute)' 
                                                        id='submenu' 
                                                        className={isVacacionesActive() ? 'cuadroItem cuadroSubmenu especial show' : 'cuadroItem cuadroSubmenu'} 
                                                        drop='end'
                                                        onToggle={handleProcessDropdownToggle}
                                                    >
                                                        <NavDropdown.Item id="subopcion" as={Link} to='/SolicitarVacaciones' className={isActive('/SolicitarVacaciones') ? 'cuadroItem cuadroOpcion show' : 'cuadroItem'}>
                                                            Solicitar 
                                                        </NavDropdown.Item>
                                                        {auth.canApproveVacations  ? (
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/AprobarVacaciones' className={isActive('/AprobarVacaciones') ? 'cuadroItem cuadroOpcion show ' : 'cuadroItem'}>
                                                                Aprobar
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                        {auth.RRHH === 1 ? (<>
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/ProcesarVacaciones' className={isActive('/ProcesarVacaciones') ? 'cuadroItem cuadroOpcion show' : 'cuadroItem'}>
                                                                Procesar
                                                            </NavDropdown.Item>
                                                            
                                                        </>
                                                        ) : null}
                                                    </NavDropdown>
                                                    {/* Modifica este NavDropdown */}
                                                    <NavDropdown 
                                                        title='Permisos' 
                                                        id='submenu' 
                                                        className={isPermisosActive() ? 'cuadroItem cuadroSubmenu show especial' : 'cuadroItem cuadroSubmenu'} 
                                                        drop='end' 
                                                        style={{ width: "100%" }}
                                                        onToggle={handleProcessDropdownToggle}
                                                    >
                                                        <NavDropdown.Item id="subopcion" as={Link} to='/SolicitarPermisos' className={isActive('/SolicitarPermisos') ? 'cuadroItem cuadroOpcion show' : 'cuadroItem'}>
                                                            Solicitar Permiso o Resto de Días de Vacaciones<br/> Pendientes (Ya pagados y no disfrutados)
                                                        </NavDropdown.Item>
                                                        {auth.canApprovePermits ? (
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/AprobarPermisos' className={isActive('/AprobarPermisos') ? 'cuadroItem cuadroOpcion show' : 'cuadroItem'}>
                                                                Aprobar Permisos
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                        {auth.RRHH === 1 ? (
                                                            <NavDropdown.Item  id="subopcion" as={Link} to='/ProcesarPermisos' className={isActive('/ProcesarPermisos') ? 'cuadroItem cuadroOpcion show' : 'cuadroItem'}>
                                                                Procesar Permisos
                                                            </NavDropdown.Item>
                                                        ) : null}
                                                    </NavDropdown>
                                                    <NavDropdown title='Expediente' id='submenu' className={isExpedienteActive() ? 'cuadroItem cuadroSubmenu show especial' : 'cuadroItem cuadroSubmenu'} drop='end' style={{ width: "100%" }}>
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/expediente/datos' className={isActive('/expediente/datos') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                                Solicitar Cambio de datos de tu expediente
                                                            </NavDropdown.Item>
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/expediente/rutograma' className={isActive('/expediente/rutograma') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                                Revisar tu Rutograma
                                                            </NavDropdown.Item>
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/expediente/documentos' className={isActive('/expediente/documentos') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                                Revisar Documentos de tu Expediente
                                                            </NavDropdown.Item>
                                                            {auth.RRHH === 1 ? (
                                                            <NavDropdown.Item id="subopcion" as={Link} to='/GestionExpediente' className={isActive('/GestionExpediente') ? 'cuadroItem especial' : 'cuadroItem'}>
                                                                Directorio de Expediente de los empleados
                                                            </NavDropdown.Item>
                                                            ) : null}                        
                                                    </NavDropdown>
                                                </NavDropdown>
                                            </Col>
                                            

                                            <Col  >
                                                <Nav.Link as={Link} to='/DirectorioEmpleados' className={isActive('/DirectorioEmpleados') ? 'active textoNavlink' : 'textoNavlink'}>
                                                    Directorio de Empleados
                                                </Nav.Link>
                                            </Col>
                                            </div>
                                            {/* <Col  >

                                                <Nav.Link href="https://www.segurosaltamira.com/" target="_blank">
                                                    Manuales
                                                </Nav.Link>
                                            </Col>
 */}
                                            {auth.RRHH === 1 ? (
                                                <Col>
                                                    <Nav.Link as={Link} to='/ControlSupervision' className={isActive('/ControlSupervision') ? 'active textoNavlink' : 'textoNavlink'}>
                                                        Control de Supervisión
                                                    </Nav.Link>
                                                </Col>
                                            ) : null}
                                            <Col>
                                            </Col>
                                            <Col >
                                                <Nav className='right-div'>
                                                    <div className="contenedor-user-info">
                                                        <div className='user-info' >{`${auth.nombres?.split(' ')[0]?.charAt(0).toUpperCase() + auth.nombres?.split(' ')[0]?.slice(1).toLowerCase() || ''} ${auth.apellidos?.split(' ')[0]?.charAt(0).toUpperCase() + auth.apellidos?.split(' ')[0]?.slice(1).toLowerCase() || ''}`}</div>
                                                        <div
                                                            className={`user-info${(auth.cargo_empleado && auth.cargo_empleado.length > 2) ? ' small-text' : ''}`}
                                                        >
                                                            {auth.cargo_empleado || 'Cargo del Empleado'}
                                                        </div>
                                                        <Navbar.Brand>
                                                            
                                                        </Navbar.Brand>
                                                    </div>
                                                    <Nav.Link  className='textoNavlink' style={{textWrap:'nowrap', marginRight:'10px'}} onClick={handleLogout}>Cerrar Sesión</Nav.Link>
                                                </Nav>
                                            </Col>
                                        </Nav>
                                    </Navbar.Collapse>
                                </Row>

                        </Offcanvas.Body>
                    </Offcanvas>
                </Navbar>
        </>
    );
}

export default NavbarEmpresa;