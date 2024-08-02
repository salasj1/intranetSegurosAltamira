import NavbarEmpresa from './components/NavbarEmpresa.tsx'
import Carrusel from './components/Carrusel.tsx'
import { BrowserRouter,Routes,Route } from 'react-router-dom'
import TableEmpresa from './components/TableEmpresa.tsx'

function App() {


  return (
     <>
     <NavbarEmpresa />
     
     <BrowserRouter>
        
        <Routes>
            <Route path="/" element={
              <>
                <Carrusel />
              </>
            } />
            <Route path="/RecibodePago" element={
              <>
                <h1>Recibo de Pago</h1>
                <TableEmpresa />
              </>
            } />
            <Route path="/Prestaciones" element={""} />
            <Route path="/SolicitarVacaciones" element={""} />
            <Route path="/AprobarVacaciones" element={""} />
            <Route path="/ProcesarVacaciones" element={""} />
            <Route path="/SolicitarPermisos" element={""} />
            <Route path="/AprobarPermisos" element={""} />
            <Route path="/ProcesarPermisos" element={""} />
            <Route path="/ARC" element={""} />
            <Route path="/DirectorioEmpleados" element={""} />
        </Routes>

        
     </BrowserRouter>
     </>
  )
}

export default App
