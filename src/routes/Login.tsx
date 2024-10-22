import { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { CSSTransition } from 'react-transition-group';
import { Link, Navigate } from 'react-router-dom';
import '../css/Login.css';
import { useAuth } from '../auth/AuthProvider';

function Login() {
    const [inProp, setInProp] = useState(false);
    const [usuario, setUsuario] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const auth = useAuth();
    const nodeRef = useRef(null);
    const [actionExecuted, setActionExecuted] = useState(false);
 

    useEffect(() => {
        setInProp(true);
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const success = await auth.login(usuario, password);
            if (!success) {
                setError('Usuario o contraseña incorrectos');
            }
        } catch (err) {
            if (err instanceof SyntaxError) {
                setError('Error en la respuesta del servidor. No es un JSON válido.');
            } else {
                setError('Error desconocido.');
            }
        }
    };

    useEffect(() => {
        if (auth.isAuthenticated && !actionExecuted) {
            // Aquí puedes poner la acción que quieres ejecutar una sola vez
            console.log('Login confirmado, ejecutando acción una sola vez.');
            setActionExecuted(true); // Marcar la acción como ejecutada
        }
    }, [auth.isAuthenticated, actionExecuted]);

    if (auth.isAuthenticated) {
        return <Navigate to="/home" />;
    }
    

    return (
        <form onSubmit={handleSubmit}>
            <CSSTransition in={inProp} nodeRef={nodeRef} timeout={300} classNames="fade" unmountOnExit>
                <div ref={nodeRef} className="d-flex justify-content-center align-items-center vh-100">
                    <div className="card p-4 shadow" style={{ width: '20rem', margin: '0 auto' }}>
                        <div className="text-center">
                            <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '180px' }} />
                        </div>
                        <div className="">
                            <h1 className="text-center mb-2" style={{ marginLeft: '-2px', color: "#003896" }}>Intranet</h1>
                            <h2 className="text-center mb-3" style={{ marginLeft: '-2px' }}>Iniciar Sesión</h2>
                        </div>
                        {error && <div className="alert alert-danger">{error}</div>}
                        <div className="mb-3">
                            <label htmlFor="usuario" className="form-label">Usuario</label>
                            <input type="text" className="form-control" id="usuario" placeholder="Ingresa tu usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} autoComplete="current-password" />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Contraseña</label>
                            <input type="password" className="form-control" id="password" placeholder="Ingresa tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>
                        <div className="mb-3">
                            <button type="submit" className="btn btn-primary w-100">Iniciar Sesión</button>
                            
                        </div>
                        <div className="mb-3">
                            <Link to="/signup"> <button type="submit" className="btn btn-primary w-100">Registrate</button></Link>
                        </div>
                        
                    </div>
                </div>
            </CSSTransition>
        </form>
    );
}

export default Login;