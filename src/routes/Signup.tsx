import { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSSTransition } from 'react-transition-group';
import '../css/Login.css'; // Reutiliza los estilos de animación de Login
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../auth/AuthProvider';
import { Navigate } from 'react-router-dom';

library.add(faArrowLeft);

function Signup() {
  const [inProp, setInProp] = useState(false);

  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
	setInProp(true);
  }, []);
  const auth=useAuth()
  if(auth.isAuthenticated){
    return <Navigate to="/home" />;
  }
  return (
	<CSSTransition in={inProp} timeout={1000} classNames="fade" unmountOnExit>
	  <div className="d-flex justify-content-center align-items-center vh-100">
		<div className="card p-4 shadow" style={{ width: '20rem', margin: '0 auto' }}>
		  <div className="d-flex justify-content-start">
			<Link to="/">
			  <button className="btn btn-link p-0">
				<FontAwesomeIcon icon="arrow-left" />
			  </button>
			</Link>
		  </div>
		  <div className="text-center">
			<img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '180px' }} />
		  </div>
		  <div className="">
			<h1 className="text-center mb-2" style={{ marginLeft: '-2px', color: "#003896" }}>Intranet</h1>
			<h2 className="text-center mb-3" style={{ marginLeft: '-2px' }}>Registrar</h2>
		  </div>
		  <form>
			<div className="mb-3">
			  <label htmlFor="usuario" className="form-label">Usuario</label>
			  <input type="usuario" className="form-control" id="usuario" placeholder="Ingresa tu usuario" value={usuario} onChange={(e)=>setUsuario(e.target.value)}/>
			</div>
			<div className="mb-3">
			  <label htmlFor="password" className="form-label">Contraseña</label>
			  <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e)=>setPassword(e.target.value)} />
			</div>
			<div className="mb-3">
			  <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
			  <input type="password" className="form-control" id="confirmPassword" placeholder="Confirma tu contraseña" />
			</div>
			<div className="mb-3">
			  <button type="submit" className="btn btn-primary w-100">Registrar</button>
			</div>
		  </form>
		</div>
	  </div>
	</CSSTransition>
  );
}

export default Signup;