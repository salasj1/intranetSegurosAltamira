import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CSSTransition } from 'react-transition-group';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../auth/AuthProvider.tsx';

library.add(faArrowLeft);

function Signup() {
  const [inProp, setInProp] = useState(false);

  const [email, setEmail] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const auth = useAuth();

  useEffect(() => {
    setInProp(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Limpiar cualquier error previo

    if (!email || !usuario || !password || !confirmPassword) {
        setError('Todos los campos son obligatorios');
        return;
    }

    if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
    }

    try {
        const result = await auth.signup(email, usuario, password, confirmPassword);
        if (result !== true) {
            setError(result as string); // Mostrar el mensaje de error del servidor
        }
    } catch (err) {
        console.error(err);
    }
};

  if (auth.isAuthenticated) {
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
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico Empresarial</label>
              <input type="email" className="form-control" id="email" placeholder="Ingresa tu correo electrónico" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="usuario" className="form-label">Usuario</label>
              <input type="text" className="form-control" id="usuario" placeholder="Ingresa tu usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="password" className="form-label">Contraseña</label>
              <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">Confirmar Contraseña</label>
              <input type="password" className="form-control" id="confirmPassword" placeholder="Confirma tu contraseña" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
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