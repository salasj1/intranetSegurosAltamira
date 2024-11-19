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
import SolicitarVacaciones from './routes/SolicitarVacaciones.tsx';
import AprobarVacaciones from './routes/AprobarVacaciones.tsx';
import ProcesarPermisos from './routes/ProcesarPermisos.tsx';
import ProcesarVacaciones from './routes/ProcesarVacaciones.tsx';
import SolicitarPermisos from './routes/SolicitarPermisos.tsx';
import AprobarPermisos from './routes/AprobarPermisos.tsx';
import ControlAutorizacion from './routes/ControlAutorizacion.tsx';


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
            <Route key="ARC" path="ARC" element={<ARC/>} />,
            <Route key="PrestacionesDetallado" path="Prestaciones/:prest_num" element={<RecibodePagoDetallado/>} />,
            <Route key="SolicitarVacaciones" path="SolicitarVacaciones" element={<SolicitarVacaciones/>} />,
            <Route key="AprobarVacaciones" path="AprobarVacaciones" element={<AprobarVacaciones/>} />,
            <Route key="ProcesarVacaciones" path="ProcesarVacaciones" element={<ProcesarVacaciones/>} />,
            <Route key="SolicitarPermisos" path="SolicitarPermisos" element={<SolicitarPermisos/>} />,
            <Route key="AprobarPermisos" path="AprobarPermisos" element={<AprobarPermisos/>} />,
            <Route key="ProcesarPermisos" path="ProcesarPermisos" element={<ProcesarPermisos/>} />,
            <Route key="DirectorioEmpleados" path="DirectorioEmpleados" element={<DirectorioEmpleados/>} />,
            <Route key="ControlSupervision" path='ControlSupervision' element={<ControlAutorizacion />} />,
            
          ]}
        ></Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;