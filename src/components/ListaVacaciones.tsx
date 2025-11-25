import React, { useState, useEffect } from 'react';
import {  Form} from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowDown, faArrowUp,  } from '@fortawesome/free-solid-svg-icons';
import styles from '../css/ListaVacaciones.module.css';
import Table from 'react-bootstrap/Table';
import { Vacacion } from '../routes/SolicitarVacaciones';
import { format, parseISO, addDays, } from 'date-fns';




interface ListaVacacionesProps {
  vacaciones: Vacacion[];
  fetchVacaciones: () => void;
  hasPreviousRequest: boolean;
  checkPreviousRequest: () => void;

}

const ListaVacaciones: React.FC<ListaVacacionesProps> = ({ vacaciones, fetchVacaciones, hasPreviousRequest }) => {
  
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [searchVacacionID, setSearchVacacionID] = useState('');
  const [searchFechaInicio, setSearchFechaInicio] = useState('');
  const [searchFechaFin, setSearchFechaFin] = useState('');
  const [searchEstado, setSearchEstado] = useState(''); 
  const [searchdiasDisfrutar, setDiasDisfrutar] = useState('');
  const [searchdiasPagar, setDiasPagar] = useState('');
  
  useEffect(() => {
    fetchVacaciones();
    console.log('Dias Disfrutar:', vacaciones[0]?.DiasDisfrutar);
  }, [hasPreviousRequest]);
  
  const sortedData = [...vacaciones].sort((a: Vacacion, b: Vacacion) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key as keyof Vacacion];
      let bValue = b[sortConfig.key as keyof Vacacion];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredData = sortedData.filter(item =>
    item.VacacionID.toString().includes(searchVacacionID) &&
    item.FechaInicio != null &&
    item.DiasPagar.toString().includes(searchdiasPagar) &&
    item.DiasDisfrutar.toString().includes(searchdiasDisfrutar) &&
    item.FechaFin != null &&
    format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy').includes(searchFechaInicio) &&
    format(addDays(parseISO(item.FechaRetorno ? item.FechaRetorno.toString() : item.FechaFin.toString()), 1), 'dd/MM/yyyy').includes(searchFechaFin) &&
    item.Estado.toLowerCase().includes(searchEstado.toLowerCase()) &&
    item.Estado.toLowerCase() !== 'borrado'
  );

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // Función auxiliar para renderizar el badge de estado
  const renderStatusBadge = (estado: string) => {
    const statusLower = estado.toLowerCase();
    let stylesBadge = {
      backgroundColor: '#f0f0f0',
      color: '#595959',
      border: '1px solid #d9d9d9'
    };

    if (statusLower === 'solicitada') {
      stylesBadge = { backgroundColor: '#fff7e6', color: '#d46b08', border: '1px solid #ffd591' }; // Naranja
    } else if (statusLower === 'aprobada') {
      stylesBadge = { backgroundColor: '#e6f7ff', color: '#096dd9', border: '1px solid #91d5ff' }; // Azul
    } else if (statusLower === 'procesada') {
      stylesBadge = { backgroundColor: '#f6ffed', color: '#389e0d', border: '1px solid #b7eb8f' }; // Verde
    } else if (statusLower === 'rechazada') {
      stylesBadge = { backgroundColor: '#fff1f0', color: '#cf1322', border: '1px solid #ffa39e' }; // Rojo
    }

    return (
      <span style={{
        ...stylesBadge,
        padding: '4px 12px',
        borderRadius: '50px', // Esto hace el óvalo
        fontWeight: '600',
        fontSize: '1rem',
        display: 'inline-block',
        textTransform: 'capitalize',
        minWidth: '100px',
        textAlign: 'center'
      }}>
        {estado}
      </span>
    );
  };

  

  return (
    <>
    <div className= {styles.tableVacaciones}>

    
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por ID..."
                value={searchVacacionID}
                onChange={(e) => setSearchVacacionID(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Fecha..."
                value={searchFechaInicio}
                onChange={(e) => setSearchFechaInicio(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Fecha..."
                value={searchFechaFin}
                onChange={(e) => setSearchFechaFin(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Estado..."
                value={searchEstado}
                onChange={(e) => setSearchEstado(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Cantidad de días..."
                value={searchdiasDisfrutar}
                onChange={(e) => setDiasDisfrutar(e.target.value)}
              />
            </th>
            <th>
              <Form.Control
                className={styles.search}
                type="text"
                placeholder="Buscar por Cantidad de días..."
                value={searchdiasPagar}
                onChange={(e) => setDiasPagar(e.target.value)}
              />
            </th>
          </tr>
        </thead>
        <thead>
          <tr>
            <th id={styles.headTable} onClick={() => requestSort('VacacionID')} className='titulo'>
              ID Vacación
              {sortConfig.key === 'VacacionID' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaInicio')} className='titulo'>
              Fecha Inicio
              {sortConfig.key === 'FechaInicio' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('FechaFin')} className='titulo'>
              Fecha Retorno
              {sortConfig.key === 'FechaFin' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('Estado')} className='titulo'>
              Estado
              {sortConfig.key === 'Estado' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() => requestSort('DiasDisfrutar')} className='titulo'>
              Cantidad días a Disfrutar
              {sortConfig.key === 'DiasDisfrutar' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
            <th id={styles.headTable} onClick={() =>requestSort('DiasPagar')}className='titulo'>
              Cantidad días a Pagar
              {sortConfig.key === 'DiasPagar' && (
                <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? faArrowDown : faArrowUp} />
              )}
            </th>
          </tr>
        </thead>

        <tbody>
          {filteredData.map(item => (
            <tr key={item.VacacionID}>
              <td>{item.VacacionID}</td>
              <td>{format(addDays(parseISO(item.FechaInicio.toString()), 1), 'dd/MM/yyyy')}</td>
                <td>{item.FechaRetorno ? format(addDays(parseISO(item.FechaRetorno.toString()), 1), 'dd/MM/yyyy') : format(addDays(parseISO(item.FechaFin.toString()), 2), 'dd/MM/yyyy')}</td>
              <td style={{ verticalAlign: 'middle', textAlign: 'center' }}>
                {renderStatusBadge(item.Estado)}
              </td>
              <td>{item.DiasDisfrutar}</td>
              <td>{item.DiasPagar}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>
      
      <h4>Estados de una solicitud</h4>
      
      
      <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            width: '100%', 
            marginBottom: '25px', 
            marginTop: '10px' 
        }}>
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                gap: '15px', 
                width: '100%', 
                maxWidth: '1100px' // Limita el ancho para que no se estire demasiado
            }}>
                
                {/* Tarjeta: Solicitada */}
                <div style={{ 
                    backgroundColor: '#fff7e6', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #faad14', // Naranja
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)',
                    transition: 'transform 0.2s'
                }}>
                    <h6 style={{ color: '#faad14', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>⏳</span> Solicitada
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Enviada y en espera de revisión por su supervisor.
                    </p>
                </div>

                {/* Tarjeta: Aprobada */}
                <div style={{ 
                    backgroundColor: '#bcdfffff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #1890ff', // Azul
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#1890ff', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>👍</span> Aprobada
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Aceptada por supervisor. En gestión de Capital Humano.
                    </p>
                </div>

                {/* Tarjeta: Procesada */}
                <div style={{ 
                    backgroundColor: '#d8ffc4ff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #52c41a', // Verde
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#52c41a', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>✅</span> Procesada
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Registrada y pagada por Capital Humano. Proceso finalizado.
                    </p>
                </div>

                {/* Tarjeta: Rechazada */}
                <div style={{ 
                    backgroundColor: '#ffc0c1ff', 
                    border: '1px solid #f0f0f0', 
                    borderTop: '4px solid #ff4d4f', // Rojo
                    borderRadius: '8px', 
                    padding: '15px', 
                    boxShadow: '0 4px 6px rgba(0,0,0,0.04)'
                }}>
                    <h6 style={{ color: '#ff4d4f', fontWeight: 'bold', margin: '0 0 5px 0', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>🚫</span> Rechazada
                    </h6>
                    <p style={{ fontSize: '12px', color: '#1d1d1dff', margin: 0, lineHeight: '1.4' }}>
                        Denegada por supervisor o Capital Humano.
                    </p>
                </div>

            </div>
            
        </div>
       
    </>
  );
};

export default ListaVacaciones;