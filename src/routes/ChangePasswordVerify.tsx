import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { Link } from "react-router-dom"
import { CSSTransition } from 'react-transition-group';

export interface Usuario {
  id: number;
  username: string;
  password: string;
  cod_emp: string;
  status: string;
}
function ChangePasswordVerify() {
  const [inProp, setInProp] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [error, setError] = useState('');
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [usuarioData, setUsuarioData] = useState<Usuario | null>(null);
  const [passwordTemp, setPasswordTemp] = useState('');
  const apiUrl = import.meta.env.VITE_API_URL;
  const handleSubmit = async (e: React.FormEvent) => {
    try {
        const result = await axios.post(`${apiUrl}/verify/${usuario}` );
        console.log(result);
        if (result.status === 200) {
            setShow1(false);
            const data = result.data.usuario;
            setUsuarioData(data);
            setError('');
            if (data.status !== "Bloqueado") {
              setShow1(false);
              setShow2(true);
              console.log("Aceptado");
            }else{
              setError('Usuario bloqueado, por favor contacte al administrador');    
            } 
        } else {
            setError('Error en el servidor, por favor intenta más tarde');
        }
    } catch (err) {
        console.error(err);
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
              setError('Usuario no encontrado');
          } else if (err.response?.status === 500) {
              setError('Error en el servidor, por favor intenta más tarde');
          } else {
              setError('Error en el servidor, por favor intenta más tarde');
          }
        } else {
          setError('Error en el servidor, por favor intenta más tarde');
        }
    }
}

  const handleVerifyCodigoTemp = async () => {
    try {
        const result = await axios.post(`${apiUrl}/verifycode/${usuario}`, { passwordTemp });
        console.log(result);
        if (result.status === 200) {
            setShow2(false);
            setShow3(true);
            setError('');
        } else {
            setError('Contraseña Incorrecta, intente de nuevo');
        }
    } catch (err) {
        console.error(err);
        if (axios.isAxiosError(err)) {
            if (err.response?.status === 500) {
                setError(err.message);
            } else {
                setError('Error en el servidor, por favor intenta más tarde');
            }
        } else {
            setError('Error en el servidor, por favor intenta más tarde');
        }
    }
}

const handleEnvioCodigo = async () => {
  try {
      const result = await axios.post(`${apiUrl}/sendcode/${usuario}`);
      console.log(result);
      if (result.status === 200) {
          setError('');
      } else {
          setError('Error en el servidor, por favor intenta más tarde');
      }
  } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
          if (err.response?.status === 500) {
              setError(err.message);
          } else {
              setError('Error en el servidor, por favor intenta más tarde');
          }
      } else {
          setError('Error en el servidor, por favor intenta más tarde');
      }

  }
}
useEffect(() => {
  setInProp(true);
}, []);

  return (
    <CSSTransition in={inProp} timeout={1000} classNames="fade" unmountOnExit>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow" style={{ width: '30rem', margin: '0 auto' }}>
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
            <h2 className="text-center mb-3" style={{ marginLeft: '-2px' }}>Cambiar Contraseña</h2>
          </div>
          {error && <Alert variant="danger" onClose={() => {setError('')}} dismissible>{error}</Alert>}
          {show1 && <><form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="usuario" className="form-label">Introduzca el usuario</label>
              <input type="text" className="form-control" id="usuario" placeholder="Ingresa tu usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
            </div>
            </form><div className="mb-3">
              <button type="submit" className="btn btn-primary w-100" onClick={(e) => { handleSubmit(e); handleEnvioCodigo(); }}>Verificar</button>
            </div></>
          }
          {show2 && <>
          <p style={{color: "rgb(63 63 65)", fontSize: "18px"}}>Se te envió un correo un codigo de validación.</p>
          <Alert variant="info">NOTA: Si esta página se cierra, puedes usar ese código de validación como contraseña para iniciar sesión</Alert>
          <Form.Control 
          type="password"
           placeholder="Introduce la contraseña temporal"
           value={passwordTemp} onChange={(e) => setPasswordTemp(e.target.value)
           } />
           <br/>
           <Button variant="primary" onClick={() => {setShow2(false);setShow3(true);handleVerifyCodigoTemp()}}>Aceptar</Button>
          </>}
          {show3 &&  <>
          <h3>¿Desea cambiar la contraseña temporal por una manual?</h3>
          <Button variant="secondary" onClick={() => setShow3(false)}>No</Button>
          <Button variant="primary" onClick={() => setShow3(false)}>Acepto</Button>
          </>}
          
        </div>
      </div>
    </CSSTransition>
  )
}

export default ChangePasswordVerify