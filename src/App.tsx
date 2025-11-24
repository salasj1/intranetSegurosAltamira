import {  Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Login from './routes/Login';
import Home from './routes/Home/Home';
import ProtectedRoute from './routes/ProtectedRoute';
import { AuthProvider } from './auth/AuthProvider';
import Signup from './routes/Signup';
import RecibodePago from './routes/ReciboDePago/RecibodePago';
import RecibodePagoDetallado from './routes/ReciboDePago/components/RecibodePagoDetallado';
import ARC from './routes/ARC';
import Prestaciones from './routes/Prestaciones';
import DirectorioEmpleados from './routes/DirectorioEmpleados';
import SolicitarVacaciones from './routes/SolicitarVacaciones';
import AprobarVacaciones from './routes/AprobarVacaciones';
import ProcesarPermisos from './routes/ProcesarPermisos';
import ProcesarVacaciones from './routes/ProcesarVacaciones';
import SolicitarPermisos from './routes/SolicitarPermisos';
import AprobarPermisos from './routes/AprobarPermisos';
import ControlAutorizacion from './routes/ControlAutorizacion';
import ChangePasswordVerify from './routes/ChangePasswordVerify';
import ConstaciaDeTrabajo from './routes/ConstaciaDeTrabajo';
import RetornoVacaciones from './routes/RetornoVacaciones';
import AdminDashboard from './routes/AdminDashboard';
import Expendiente from '@/routes/Expediente/Expendiente';
import RRHHExpedientes from './routes/Expediente/RRHHExpedientes';

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
            <Route path="expediente/:seccion" element={<Expendiente />} />
            <Route path="Admin" element={<AdminDashboard />} />
            <Route path="GestionExpediente" element={<RRHHExpedientes />} />
          </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;