import React from 'react';
import { Modal, Button, Alert } from 'react-bootstrap';
import { format, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

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

const ModalDescripcionPermiso: React.FC<ModalDescripcionPermisoProps> = ({ show, onHide, permiso, fetchPermisos, context,error,setError }) => {
  const { cod_emp } = useAuth();

  if (!permiso) return null;

  const handleAction = async (action: 'approve' | 'reject') => {
    try {
      if (context === 'aprobacion') {
        if (action === 'approve') {
          console.log("Entro en aprobar",permiso.PermisosID);
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
        console.log("Entro en procesar",permiso.PermisosID);
        if (action === 'approve') {
          console.log("Entro en procesar",permiso.PermisosID);
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
      console.error(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso`);
      setError(`Error ${action === 'approve' ? 'aprobando' : 'rechazando'} permiso. Cargue de nuevo la pagina.`);
      if (axios.isAxiosError(error)) {
        console.error(error.response);
      }
    }
  };

  return (
    <Modal size="lg" show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{permiso.Titulo}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
      {error && <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
          <Alert variant='primary' style={{ width: "75%" }}>
            <h3>Detalles del Permiso</h3>
            <hr />
            <div style={{ display: "flex", justifyContent: "space-between", flexDirection: "column", gap: "5px" }}>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>ID Permiso:</strong> {permiso.PermisosID}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Cédula:</strong> {permiso.ci}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Empleado:</strong> {permiso.nombres+" "+permiso.apellidos}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Departamento:</strong> {permiso.departamento}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Cargo:</strong> {permiso.cargo}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Fecha Inicio:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Fecha Fin:</strong> {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')}</p>
              <p style={{ fontSize: "18px", margin: "0" }}><strong>Motivo:</strong> {permiso.Motivo}</p>
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
      </Modal.Body>
    </Modal>
  );
};

export default ModalDescripcionPermiso;