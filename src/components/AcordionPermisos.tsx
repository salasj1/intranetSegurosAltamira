import { useEffect, useState } from 'react';
import { Accordion, Card, Alert } from "react-bootstrap";
import style from '../css/accordion.module.css';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { format, parseISO, addDays } from 'date-fns';

const apiUrl = import.meta.env.VITE_API_URL;
interface Permiso {
  PermisosID: number;
  cod_emp: string;
  Fecha_inicio: string;
  Fecha_Fin: string;
  Titulo: string;
  Motivo: string;
  Estado: string;
  cod_supervisor: string;
  cod_RRHH: string;
  descripcion: string;
  descontable: boolean;
}

interface AcordionPermisosProps {
  refresh: boolean;
}

function AcordionPermisos({ refresh }: AcordionPermisosProps) {
  const { cod_emp } = useAuth();
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermisos = async () => {
      try {
        const response = await axios.get(`${apiUrl}/permisos/id/${cod_emp}`);
        setPermisos(response.data);
      } catch (error) {
        console.error('Error al obtener permisos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, [cod_emp, refresh]);

  // --- FUNCIÓN PARA RENDERIZAR EL BADGE (Copiada de ListaVacaciones) ---
  const renderStatusBadge = (estado: string) => {
    const statusLower = estado.toLowerCase();
    let stylesBadge = {
      backgroundColor: '#f0f0f0',
      color: '#595959',
      border: '1px solid #d9d9d9'
    };

    if (statusLower === 'solicitada' || statusLower === 'pendiente') {
      stylesBadge = { backgroundColor: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' }; // Naranja
    } else if (statusLower === 'aprobada' || statusLower === 'aprobado') {
      stylesBadge = { backgroundColor: '#e6f7ff', color: '#096dd9', border: '1px solid #91d5ff' }; // Azul
    } else if (statusLower === 'procesada') {
      stylesBadge = { backgroundColor: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }; // Verde
    } else if (statusLower === 'rechazada' || statusLower === 'rechazado') {
      stylesBadge = { backgroundColor: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' }; // Rojo
    }

    return (
      <span style={{
        ...stylesBadge,
        padding: '2px 10px', // Un poco más pequeño para el acordeón
        borderRadius: '50px',
        fontWeight: '600',
        fontSize: '0.85rem',
        display: 'inline-block',
        textTransform: 'capitalize',
        minWidth: '90px',
        textAlign: 'center',
        whiteSpace: 'nowrap'
      }}>
        {estado}
      </span>
    );
  };
  // -------------------------------------------------------------------

  if (loading) {
    return (
      <Accordion defaultActiveKey={null} flush className={`${style.accordion} ${style.accordionSolicitados}`}>
        <Card bg='light' className={style.accordionItem} style={{ borderRadius: '0px' }} key={0}>
          <Accordion.Item eventKey={"0"}>
            <Accordion.Header>
              <strong>Cargando...</strong>
            </Accordion.Header>
            <Accordion.Collapse eventKey={"0"}>
              <Card.Body>
                Espere un momento por favor
              </Card.Body>
            </Accordion.Collapse>
          </Accordion.Item>
        </Card>
      </Accordion>
    );
  }

  if (permisos.length === 0) {
    return <Alert variant="warning" className={`${style.accordion} ${style.accordionSolicitados}`}>No hay permisos solicitados</Alert>;
  }

  return (
    <Accordion defaultActiveKey={null} flush className={`${style.accordion} ${style.accordionSolicitados}`}>
      {permisos.map((permiso) => (
        <Card bg='light' className={style.accordionItem} style={{ borderRadius: '0px' }} key={permiso.PermisosID}>
          <Accordion.Item eventKey={permiso.PermisosID.toString()}>
            <Accordion.Header>
              {/* Contenedor Flex para alinear Badge y Título */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '100%' }}>
                {renderStatusBadge(permiso.Estado)}
                <span style={{ fontSize: '1.05rem', color: '#333' }}>{permiso.Titulo}</span>
              </div>
            </Accordion.Header>
            <Accordion.Collapse eventKey={permiso.PermisosID.toString()}>
              <Card.Body>
                <strong>Fecha:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')} al {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')} <br />
                <strong>Motivo:</strong> {permiso.Motivo} <br />
                <strong>Estado:</strong> {permiso.Estado} <br />
                <strong>Descontado de las Vacaciones: </strong> {permiso.descontable ? 'Si' : 'No'} <br />
                <strong>Descripción: </strong> <br />
                {permiso.descripcion}
              </Card.Body>
            </Accordion.Collapse>
          </Accordion.Item>
        </Card>
      ))}
    </Accordion>
  );
}

export default AcordionPermisos;