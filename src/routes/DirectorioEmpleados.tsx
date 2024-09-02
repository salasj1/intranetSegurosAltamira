import ListaCardEmpleados from "../components/ListaCardEmpleados"
import NavbarEmpresa from "../components/NavbarEmpresa"
import '../css/DirectorioEmpleado.css'

function DirectorioEmpleados() {
  return (
    <>
        
        <NavbarEmpresa />
        <h1 className="Titulo">Directorio de Empleados</h1>
        <ListaCardEmpleados />
    </>
  )
}

export default DirectorioEmpleados