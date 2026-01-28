import React, { useState } from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { format, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import stylesLoading from "../css/loading.module.css";
import { Mosaic } from "react-loading-indicators";

const apiUrl = import.meta.env.VITE_API_URL;

interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string | string[];
  descripcion: string;
  descontable: boolean;
  ci: string;
  nombres: string;
  apellidos: string;  
  departamento: string;
  cargo: string;
}

interface ModalDescripcionPermisoProps {
  show: boolean;
  onHide: () => void;
  permiso: Permiso | null;
  fetchPermisos: () => void;
  context: 'aprobacion' | 'procesar'; 
  error: string | null; 
  setError: (message: string) => void;
}

const ModalDescripcionPermiso: React.FC<ModalDescripcionPermisoProps> = ({ show, onHide, permiso, fetchPermisos, context, error, setError }) => {
  const { cod_emp } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Estado de carga

  if (!permiso) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    setIsLoading(true); // Activar el estado de carga
    try {
      if (context === 'aprobacion') {
        if (action === 'approve') {
        
          await axios.put(`${apiUrl}/permisos/${permiso.PermisosID}/approve`, {
            cod_supervisor: cod_emp
          });
        } else {
          await axios.put(`${apiUrl}/permisos/${permiso.PermisosID}/reject1`, {
            cod_supervisor: cod_emp
          });
        }
      } 
      if (context === 'procesar') {
        if (action === 'approve') {
          await axios.put(`${apiUrl}/permisos/${permiso.PermisosID}/process`, {
            cod_supervisor: cod_emp
          });
        } else {
          await axios.put(`${apiUrl}/permisos/${permiso.PermisosID}/reject2`, {
            cod_supervisor: cod_emp
          });
        }
      }

      fetchPermisos();
      onHide();
    } catch (error) {
      let errorMessage = 'Error al solicitar permiso';
      if (axios.isAxiosError(error) && error.response?.data) {
        console.error(error.response.data);
        errorMessage = error.response.data.message;
      }
      setError(errorMessage); // Establecer el mensaje de error
    } finally {
      setIsLoading(false); // Desactivar el estado de carga
    }
  };

  return (
    <Modal size="lg" show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{permiso.Titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {isLoading ? ( // Mostrar el estado de carga si isLoading es true
          <div className={stylesLoading.loadingDocument} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '15px', textAlign: 'center' }}>
            <Mosaic color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
            <h5>Procesando su solicitud, por favor espere un momento.</h5>
          </div>
        ) : (
          <>
            {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
              <Alert variant='primary' style={{ width: "75%" }}>
                <h3>Detalles del Permiso</h3>
                <hr />
                <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column", gap: "5px" }}>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>ID Permiso:</strong> {permiso.PermisosID}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Cédula:</strong> {permiso.ci}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Empleado:</strong> {permiso.nombres + " " + permiso.apellidos}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Departamento:</strong> {permiso.departamento}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Cargo:</strong> {permiso.cargo}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Fecha Inicio:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Fecha Fin:</strong> {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Motivo:</strong> {permiso.Motivo}</p>
                  <p style={{ fontSize: "18px", margin: "0" }}><strong>Descontado de las Vacaciones: </strong> {permiso.descontable ? 'Si' : 'No'} </p>
                </div>
              </Alert>
              <div style={{ display: "flex", flexDirection: "row", gap: "5px" }}>
                {(permiso.Estado === 'Pendiente' && context === 'aprobacion') || (permiso.Estado[0] === 'Aprobada' && context === 'procesar') ? (
                  <>
                    <Button variant="success" onClick={() => handleAction('approve')}>
                      {context === 'aprobacion' ? 'Aprobar' : 'Procesar'}
                    </Button>
                    <Button variant="danger" onClick={() => handleAction('reject')}>
                      Rechazar
                    </Button>
                  </>
                ) : null}
              </div>
            </div>
            <hr />
            <br />
            <h4><strong>Descripción:</strong></h4>
            <br />
            <p style={{ marginInline: "30px" }}>
              {permiso.descripcion}
            </p>
            <br />
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default ModalDescripcionPermiso;