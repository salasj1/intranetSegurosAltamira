import { useState } from 'react';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../css/TablaEmpresa.css';
import { Link } from 'react-router-dom';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

library.add(faArrowDown, faArrowUp);

interface MyData {
  id: number;
  año: number;
  mes: number;
  tipo: string;
  [key: string]: number | string;
}

function TableEmpresa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });

  const data: MyData[] = [
    { id: 1, año: 2024, mes: 1, tipo: '1era Quincena' },
    { id: 2, año: 2024, mes: 4, tipo: 'Vacaciones' },
    { id: 3, año: 2023, mes: 6, tipo: '2da Quincena' },
    { id: 4, año: 2023, mes: 12, tipo: '1era Quincena' },
    { id: 5, año: 2022, mes: 7, tipo: 'Vacaciones' },
    { id: 6, año: 2021, mes: 8, tipo: 'Utilidades' }
  ];

  const sortedData = [...data].sort((a: MyData, b: MyData) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
    }
    return 0;
  });

  const nombresMeses = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const obtenerNombreMes = (numeroMes: number) => {
    return nombresMeses[numeroMes - 1];
  };

  const filteredData = sortedData.filter(item =>
    item.año.toString().includes(searchTerm) ||
    obtenerNombreMes(item.mes).toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipo.toLowerCase().includes(searchTerm.toLowerCase())
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
      <div className="canvas">
        <input
          className='search'
          type="text"
          placeholder="Buscar..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />
        
        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th onClick={() => requestSort('id')}>
                #
                {sortConfig.key === 'id' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('año')}>
                Año
                {sortConfig.key === 'año' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('mes')}>
                Mes
                {sortConfig.key === 'mes' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('tipo')}>
                Tipo de Recibo
                {sortConfig.key === 'tipo' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.año}</td>
                <td>{obtenerNombreMes(item.mes)}</td>
                <td>{item.tipo}</td>
                <td>
                  <Link to={"./" + item.key}>
                    <Button variant="primary">Ver</Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default TableEmpresa;
/* 
export default TableEmpresa;{ useState } from 'react';
import Table from "react-bootstrap/esm/Table";
import Button from 'react-bootstrap/Button';
import '../css/TablaEmpresa.css';

function TableEmpresa() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: DataKey; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'asc' });

  const data: { id: number; fecha: string; tipo: string; monto: string; }[] = [
    { id: 1, fecha: 'Julio', tipo: 'Quincena', monto: '1000.00' },
    { id: 2, fecha: 'Julio', tipo: 'Vacacionales', monto: '255.00' },
    // Agrega más datos aquí si es necesario
  ];

  const sortedData = [...data].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
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
    item.fecha.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.monto.includes(searchTerm)
  );

  return (
    <div className="table-responsive">
      <input
        type="text"
        placeholder="Buscar..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      />
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha</th>
            <th>Tipo de Recibo</th>
            <th>Monto (Bs.)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map(item => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.fecha}</td>
              <td>{item.tipo}</td>
              <td>{item.monto}</td>
              <td><Button variant="primary">Primary</Button></td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default TableEmpresa;*/ 