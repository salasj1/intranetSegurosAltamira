
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './routes/Login.tsx';
import Home from './routes/Home.tsx';
import ProtectedRoute from './routes/ProtectedRoute.tsx';
import { AuthProvider } from './auth/AuthProvider.tsx';
import Signup from './routes/Signup.tsx';
import RecibodePago from './routes/RecibodePago.tsx';
import RecibodePagoDetallado from './routes/RecibodePagoDetallado.tsx';
import ARC from './routes/ARC.tsx';
import Prestaciones from './routes/Prestaciones.tsx';
import DirectorioEmpleados from './routes/DirectorioEmpleados.tsx';
import NavbarEmpresa from './components/NavbarEmpresa.tsx';
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/" element={<ProtectedRoute />}
          children={[
            <Route key="home" path="home" element={<Home />} />,
            <Route key="RecibodePago" path="RecibodePago" element={<RecibodePago/>} />,
            <Route key="RecibodePagoDetallado" path="RecibodePago/:reci_num" element={<RecibodePagoDetallado/>} />, 
            <Route key="Prestaciones" path="Prestaciones" element={<Prestaciones/>} />,
            <Route key="PrestacionesDetallado" path="Prestaciones/:prest_num" element={<RecibodePagoDetallado/>} />,
            <Route key="SolicitarVacaciones" path="SolicitarVacaciones" element={<><NavbarEmpresa /><h1>Solicitar Vacaciones</h1></>} />,
            <Route key="AprobarVacaciones" path="AprobarVacaciones" element={<><NavbarEmpresa /><h1>Aprobar Vacaciones</h1></>} />,
            <Route key="ProcesarVacaciones" path="ProcesarVacaciones" element={<><NavbarEmpresa /><h1>Procesar Vacaciones</h1></>} />,
            <Route key="SolicitarPermisos" path="SolicitarPermisos" element={<><NavbarEmpresa /><h1>Solicitar Permisos</h1></>} />,
            <Route key="AprobarPermisos" path="AprobarPermisos" element={<><NavbarEmpresa /><h1>Aprobar Permisos</h1></>} />,
            <Route key="ProcesarPermisos" path="ProcesarPermisos" element={<><NavbarEmpresa /><h1>Procesar Permisos</h1></>} />,
            <Route key="ARC" path="ARC" element={<ARC/>} />,
            <Route key="DirectorioEmpleados" path="DirectorioEmpleados" element={<DirectorioEmpleados/>} />
          ]}
        ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;