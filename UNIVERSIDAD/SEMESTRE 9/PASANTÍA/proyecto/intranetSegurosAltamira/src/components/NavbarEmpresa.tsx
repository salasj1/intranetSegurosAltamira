import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import '../css/NavbarEmpresa.css';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas,faBell } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
library.add(fas, faBell)
import Hamburguesa from './Hamburguesa.tsx';
function NavbarEmpresa() {
  return (
      <>
          <div className='NavbarEmpresa'>
              <Navbar bg="light" data-bs-theme="light" id="Navegador">
              <Navbar.Brand className='imagenEmpresa' href="/">
                          <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" />
                      </Navbar.Brand>
                  <Container>
                      <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                      <Navbar.Collapse id="responsive-navbar-nav">
                          <Nav className="me-auto">
                              <Nav.Link href="/RecibodePago">Recibo de pago</Nav.Link>
                              <Nav.Link href="/Prestaciones">Movimientos de Prestaciones Sociales</Nav.Link>
                              <NavDropdown title="Vacaciones" id="navbarScrollingDropdown">
                                  <NavDropdown.Item href="/SolicitarVacaciones">Solicitar Vacaciones</NavDropdown.Item>
                                  <NavDropdown.Item href="/AprobarVacaciones">Aprobar Vacaciones</NavDropdown.Item>
                                  <NavDropdown.Item href="/ProcesarVacaciones">Procesar Vacaciones</NavDropdown.Item>
                              </NavDropdown>
                              <NavDropdown title="Permisos" id="navbarScrollingDropdown">
                                  <NavDropdown.Item href="/SolicitarPermisos">Solicitar Permisos</NavDropdown.Item>
                                  <NavDropdown.Item href="/AprobarPermisos">Aprobar Permisos</NavDropdown.Item>
                                  <NavDropdown.Item href="/ProcesarPermisos">Procesar Permisos</NavDropdown.Item>
                              </NavDropdown>
                              <Nav.Link href="/ARC">ARC</Nav.Link>
                              <Nav.Link href="/DirectorioEmpleados">Directorio de Empleados</Nav.Link>
                              <Nav className="right-div">
                                  <div className="user-info">Nombre Completo</div>
                                  <div className="user-info">Cargo del Empleado</div>
                                  <Navbar.Brand href="/notificaciones">
                                    <FontAwesomeIcon icon={["fas", "bell"]} style={{ color: "#ff7b00" }} />
                                  </Navbar.Brand>
                                  <div className="divHamburguesa">
                                    <Hamburguesa />
                                  </div>
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