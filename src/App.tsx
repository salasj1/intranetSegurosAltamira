import {  Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import Expendiente from './routes/Expendiente.tsx';
import RRHHExpedientes from './routes/RRHHExpedientes';

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
        <Route path="/" element={<ProtectedRoute />}>
            <Route path="home" element={<Home />} />
            <Route path="RecibodePago" element={<RecibodePago />} />
            <Route path="RecibodePago/:reci_num" element={<RecibodePagoDetallado />} />
            <Route path="Prestaciones" element={<Prestaciones />} />
            <Route path="ConstanciaDeTrabajo" element={<ConstaciaDeTrabajo />} />
            <Route path="ARC" element={<ARC />} />
            <Route path="Prestaciones/:prest_num" element={<RecibodePagoDetallado />} />
            <Route path="SolicitarVacaciones" element={<SolicitarVacaciones />} />
            <Route path="AprobarVacaciones" element={<AprobarVacaciones />} />
            <Route path="ProcesarVacaciones" element={<ProcesarVacaciones />} />
            <Route path="RetornoVacaciones" element={<RetornoVacaciones />} />
            <Route path="SolicitarPermisos" element={<SolicitarPermisos />} />
            <Route path="AprobarPermisos" element={<AprobarPermisos />} />
            <Route path="ProcesarPermisos" element={<ProcesarPermisos />} />
            <Route path="DirectorioEmpleados" element={<DirectorioEmpleados />} />
            <Route path="ControlSupervision" element={<ControlAutorizacion />} />
            <Route path="expediente" element={<Expendiente />}>
              <Route index element={<Navigate to="datos" replace />} />
              <Route path="datos" element={<Expendiente />} />
              {/* <Route path="rutas" element={<Expendiente />} /> */}
              <Route path="documentos" element={<Expendiente />} />
            </Route>
            <Route path="Admin" element={<AdminDashboard />} />
            <Route path="GestionExpediente" element={<RRHHExpedientes />} />
          </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;