import React, { useState, useEffect } from 'react';
import { Form} from 'react-bootstrap';
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
              <td>{item.Estado}</td>
              <td>{item.DiasDisfrutar}</td>
              <td>{item.DiasPagar}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      </div>

      
    </>
  );
};

export default ListaVacaciones;