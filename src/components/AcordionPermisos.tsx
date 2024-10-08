import { useEffect, useState } from 'react';
import { Accordion, Card, Alert } from "react-bootstrap";
import style from '../css/accordion.module.css';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';
import { format, parseISO, addDays } from 'date-fns';

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
        const response = await axios.get(`/api/permisos/id/${cod_emp}`);
        setPermisos(response.data);
      } catch (error) {
        console.error('Error al obtener permisos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPermisos();
  }, [cod_emp, refresh]);

  if (loading) {
    return (
      <Accordion defaultActiveKey={null} flush className={style.accordion}>
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
    return <Alert variant="warning" className={style.accordion}>No hay permisos solicitados</Alert>;
  }

  return (
    <Accordion defaultActiveKey={null} flush className={style.accordion}>
      {permisos.map((permiso) => (
        <Card bg='light' className={style.accordionItem} style={{ borderRadius: '0px' }} key={permiso.PermisosID}>
          <Accordion.Item eventKey={permiso.PermisosID.toString()}>
            <Accordion.Header>
              <strong>{permiso.Titulo}</strong>
            </Accordion.Header>
            <Accordion.Collapse eventKey={permiso.PermisosID.toString()}>
              <Card.Body>
                <strong>Fecha:</strong> {format(addDays(parseISO(permiso.Fecha_inicio.toString()), 1), 'dd/MM/yyyy')} al {format(addDays(parseISO(permiso.Fecha_Fin.toString()), 1), 'dd/MM/yyyy')} <br />
                <strong>Motivo:</strong> {permiso.Motivo} <br />
                <strong>Estado:</strong> {permiso.Estado} <br />
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