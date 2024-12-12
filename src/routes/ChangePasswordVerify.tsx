import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Alert, Button, Form } from "react-bootstrap";
import { CSSTransition } from 'react-transition-group';

export interface Usuario {
  id: number;
  username: string;
  password: string;
  cod_emp: string;
  status: string;
  correo: string;
}

function ChangePasswordVerify() {
  const [inProp, setInProp] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [error, setError] = useState('');
  const [show1, setShow1] = useState(true);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [show5, setShow5] = useState(false);
  const [usuarioData, setUsuarioData] = useState<Usuario | null>(null);
  const [passwordTemp, setPasswordTemp] = useState('');
  const [passwordManual, setPasswordManual] = useState('');
  const [passwordManualConfirm, setPasswordManualConfirm] = useState('');
  const [contador, setContador] = useState<number>(60); // Contador inicial de 60 segundos
  const [botonHabilitado, setBotonHabilitado] = useState<boolean>(false);
  const [mensaje, setMensaje] = useState<string>('');

  const apiUrl = import.meta.env.VITE_API_URL;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await axios.post(`${apiUrl}/verify/${usuario}`);
      console.log(result.data.usuario);
      if (result.status === 200) {
        const data = result.data.usuario;
        setUsuarioData(data);
        console.log(data);
        setError('');
        if (data.status !== "Bloqueado") {
          setShow1(false);
          setShow2(true);
        } else {
          setError('Usuario bloqueado, por favor contacte al administrador');
        }
      } else {
        setError('Error en el servidor, por favor intenta más tarde');
      }
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 404) {
          setError('Usuario no encontrado');
        } else if (err.response?.status === 500) {
          setError('Error en el servidor, por favor intenta más tarde');
        } else {
          setError('Error en el servidor, por favor intenta más tarde');
        }
      } else {
        setError('Error en el servidor, por favor intenta más tarde');
      }
    }
  };

  useEffect(() => {
    if (contador > 0) {
      const timer = setTimeout(() => setContador(contador - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setBotonHabilitado(true);
      setMensaje('');
    }
  }, [contador]);

  const handleEnvioCodigo = async () => {
    try {
      console.log("EL CORREO ES: " + usuarioData?.correo);
      console.log("EL CODIGO ES: " + usuarioData?.cod_emp);
      console.log("EL USUARIO ES: " + usuarioData);
      const result = await axios.put(`${apiUrl}/changepassword1/${usuarioData?.cod_emp}`, { correo: "alejandro.salas@segurosaltamira.com" });
      console.log(result);
      if (result.status === 200) {
        setError('');
        setMensaje('Código enviado exitosamente');
        setContador(60); // Reiniciar el contador
        setBotonHabilitado(false); // Deshabilitar el botón nuevamente
      } else {
        setError('Error en el servidor, por favor intenta más tarde');
      }
      console.log("enviado")
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
  };

  const handleVerifyCodigoTemp = async () => {
    try {
      
      const result = await axios.post(`${apiUrl}/verifycode/${usuario}`, { codigoTemporal: passwordTemp });
      console.log(result);
      if (result.status === 200) {
        setShow2(false);
        setShow3(true);
        setError('');
      } else {
        setError('Contraseña Incorrecta, intente de nuevo');
      }
      console.log("verificado");
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Error de conexión, por favor verifica tu red');
        } else {
          setError(err.response?.data.message);
        }
      } else {
        setError('Error en el servidor, por favor intenta más tarde');
      }
    }
  };

  const handleCambioPasswordManual = async () => {
    try {
      const result = await axios.put(`${apiUrl}/changepassword2/${usuarioData?.cod_emp}`, { password: passwordManual,confirmpassword: passwordManualConfirm });
      if (result.status === 200) {
        setShow4(false);
        setShow5(true);
        setError('');
      } else if (result.status === 400) {
        setError(result.data.message);
      } else {
        setError('Error en el servidor, por favor intenta más tarde');
      } 
    }catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        if (err.code === 'ERR_NETWORK') {
          setError('Error de conexión, por favor verifica tu red');
        } else {
          setError(err.response?.data.message);
        }
      
      } 
      
  }
  }

  useEffect(() => {
    setInProp(true);
  }, []);

  useEffect(() => {
    if (show2){
    if (usuarioData) {
      console.log("Usuario data actualizado:", usuarioData);
      handleEnvioCodigo(); 
    }}
  }, [usuarioData]);

  return (
    <CSSTransition in={inProp} timeout={1000} classNames="fade" unmountOnExit>
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="card p-4 shadow" style={{ width: '30rem', margin: '0 auto' }}>
          <div className="d-flex justify-content-start">
            {
              !show5 && <button className="btn btn-link p-0" onClick={() => {
                if (show1) {
                  window.history.back();
                } else if (show2) {
                  setError('');
                  setShow2(false);
                  setShow1(true);
                } else if (show3) {
                  setError('');
                  handleEnvioCodigo();
                  setShow3(false);
                  setShow2(true);
                } else if (show4) {
                  setError('');
                  setShow4(false);
                  setShow3(true);
                }
              }}>
                <FontAwesomeIcon icon="arrow-left" />
              </button>
            }
            
          </div>
          <div className="text-center">
            <img src='https://www.segurosaltamira.com/wp-content/uploads/2024/03/logo-head.svg' alt="Logo Empresa" style={{ width: '180px' }} />
          </div>
          <div className="">
            <h1 className="text-center mb-2" style={{ marginLeft: '-2px', color: "#003896" }}>Intranet</h1>
            <h2 className="text-center mb-3" style={{ marginLeft: '-2px' }}>Cambiar Contraseña</h2>
          </div>
          {error && <Alert variant="danger" onClose={() => { setError('') }} dismissible>{error}</Alert>}
          {show1 && <>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="usuario" className="form-label">Introduzca el usuario</label>
                <input type="text" className="form-control" id="usuario" placeholder="Ingresa tu usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} />
              </div>
            </form>
            <div className="mb-3">
              <button type="submit" className="btn btn-primary w-100" onClick={async (e) => { handleSubmit(e); }}>Verificar</button>
            </div>
          </>
          }
          {show2 && <>
            <p style={{ color: "rgb(63 63 65)", fontSize: "18px" }}>Se te envió un código al correo empresarial para su validación.</p>

            <Alert variant="info">NOTA: Si esta página se cierra, puedes usar ese código de validación como contraseña para iniciar sesión</Alert>
            <Form.Control
              type="password"
              placeholder="Introduce el código de validación"
              value={passwordTemp} onChange={(e) => setPasswordTemp(e.target.value)
              } />
            <br />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button variant="outline-primary" onClick={handleEnvioCodigo} disabled={!botonHabilitado}>
                Volver a enviar código
              </Button>
              <Button variant="primary" onClick={() => { handleVerifyCodigoTemp() }}>Aceptar</Button>
              <br />
            </div>
            <br />
            {contador > 0 && <Alert>
              {!botonHabilitado && <p>Espera {contador} segundos para reenviar el código.</p>}
              <p>{mensaje}</p>
            </Alert>}
          </>
          }

          {show3 && <>
            <p style={{ color: "rgb(63 63 65)", fontSize: "18px" }}>¿Desea cambiar la contraseña temporal por una manual?</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button variant="secondary" onClick={() => { window.location.href = '/' }}>No Acepto</Button>
              <Button variant="primary" onClick={() => {setShow3(false); setShow4(true);}}>Acepto</Button>
            </div>
          </>}

          {show4 && <>
            <p style={{ color: "rgb(63 63 65)", fontSize: "18px" }}>Realicemos el cambio de contraseña manual</p>
            
            <Form.Control
              type="password"
              placeholder="Introduce la nueva contraseña"
              value={passwordManual} onChange={(e) => setPasswordManual(e.target.value)
              } />
            <br />
            <Form.Control
              type="password"
              placeholder="Confirma la nueva contraseña"
              value={passwordManualConfirm} onChange={(e) => setPasswordManualConfirm(e.target.value)
              } />
            <br />
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button variant="secondary" onClick={() => {setShow3(true);setShow4(false);}}>Cancelar</Button>
              <Button variant="primary" onClick={() => handleCambioPasswordManual()}>Aceptar</Button>
              <br />
            </div>
          </>}
          {show5 && <>
          <Alert variant="success">
            <h4>Contraseña cambiada exitosamente</h4>
            <hr />
            <p >Tu contraseña ha sido cambiada exitosamente, ahora puedes iniciar sesión con tu nueva contraseña</p>
          </Alert>
          
            <p style={{display: "flex", alignItems: "center"}}>Haz click en el siguiente botón para iniciar sesión</p>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <Button variant="primary" onClick={() => { window.location.href = '/' }}>Iniciar Sesión</Button>
            </div>
          </>}
        </div>
      </div>
    </CSSTransition>
  )
}

export default ChangePasswordVerify;