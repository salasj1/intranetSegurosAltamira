import ListaCardEmpleados from "../components/ListaCardEmpleados"
import NavbarEmpresa from "../components/NavbarEmpresa"
import '../css/DirectorioEmpleado.css'
import logoEmpresa from '../assets/logo-login-2.png';
function DirectorioEmpleados() {
  return (
    <>
        <div className="fondoDirectorio">
        <NavbarEmpresa />
        <h1 className="Titulo" >
        <img src={logoEmpresa} alt="icono" className='cardImg' />Directorio de Empleados</h1>
        <ListaCardEmpleados />
        </div>
    </>
  )
}

export default DirectorioEmpleados