import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
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
import SolicitarVacaciones from './routes/SolicitarVacaciones.tsx';
import AprobarVacaciones from './routes/AprobarVacaciones.tsx';
import ProcesarPermisos from './routes/ProcesarPermisos.tsx';
import ProcesarVacaciones from './routes/ProcesarVacaciones.tsx';
import SolicitarPermisos from './routes/SolicitarPermisos.tsx';
import AprobarPermisos from './routes/AprobarPermisos.tsx';
import ControlAutorizacion from './routes/ControlAutorizacion.tsx';
import ChangePasswordVerify from './routes/ChangePasswordVerify.tsx';
import ConstaciaDeTrabajo from './routes/ConstaciaDeTrabajo.tsx';
import RetornoVacaciones from './routes/RetornoVacaciones.tsx';
import AdminDashboard from './routes/AdminDashboard.tsx';

function App() {
  const location = useLocation();

  useEffect(() => {
    const rootElement = document.querySelector(':root');
    const bodyElement = document.querySelector('body');
    if (rootElement && bodyElement) {
      if (location.pathname === '/DirectorioEmpleados' || location.pathname === '/Admin') {
        rootElement.classList.add('directorio-root');
        bodyElement.classList.add('directorio-root');
      } else {
        rootElement.classList.remove('directorio-root');
        bodyElement.classList.remove('directorio-root');
      }
    }
  }, [location]);

  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/change-password-verify" element={<ChangePasswordVerify />} />
        <Route
          path="/"
          element={<ProtectedRoute />}
          children={[
            <Route key="home" path="home" element={<Home />} />,
            <Route key="RecibodePago" path="RecibodePago" element={<RecibodePago />} />,
            <Route key="RecibodePagoDetallado" path="RecibodePago/:reci_num" element={<RecibodePagoDetallado />} />,
            <Route key="Prestaciones" path="Prestaciones" element={<Prestaciones />} />,
            <Route key="ConstanciaDeTrabajo" path="ConstanciaDeTrabajo" element={<ConstaciaDeTrabajo />} />,
            <Route key="ARC" path="ARC" element={<ARC />} />,
            <Route key="PrestacionesDetallado" path="Prestaciones/:prest_num" element={<RecibodePagoDetallado />} />,
            <Route key="SolicitarVacaciones" path="SolicitarVacaciones" element={<SolicitarVacaciones />} />,
            <Route key="AprobarVacaciones" path="AprobarVacaciones" element={<AprobarVacaciones />} />,
            <Route key="ProcesarVacaciones" path="ProcesarVacaciones" element={<ProcesarVacaciones />} />,
            <Route key="RetornoVacaciones" path="RetornoVacaciones" element={<RetornoVacaciones />} />,
            <Route key="SolicitarPermisos" path="SolicitarPermisos" element={<SolicitarPermisos />} />,
            <Route key="AprobarPermisos" path="AprobarPermisos" element={<AprobarPermisos />} />,
            <Route key="ProcesarPermisos" path="ProcesarPermisos" element={<ProcesarPermisos />} />,
            <Route key="DirectorioEmpleados" path="DirectorioEmpleados" element={<DirectorioEmpleados />} />,
            <Route key="ControlSupervision" path="ControlSupervision" element={<ControlAutorizacion />} />,
            <Route key="Admin" path="Admin" element={<AdminDashboard />} />,
          ]}
        ></Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;