import { useState, useEffect } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';
import '../css/TablaEmpresa.css';
import { useNavigate } from 'react-router-dom'; 
import { library } from '@fortawesome/fontawesome-svg-core';
import { faArrowDown, faArrowUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useAuth } from '../auth/AuthProvider'; 
import { Alert, AlertHeading, Form } from 'react-bootstrap';

library.add(faArrowDown, faArrowUp);
const apiUrl = import.meta.env.VITE_API_URL;
interface Recibo {
  reci_num: number;
  cod_emp: string;
  AÑIO: number;
  Mes: string;
  Contrato: string;
}

function TableRecibodePago() {
  const { cod_emp } = useAuth(); 
  const [searchReciNum, setSearchReciNum] = useState('');
  const [searchAnio, setSearchAnio] = useState('');
  const [searchMes, setSearchMes] = useState('');
  const [searchContrato, setSearchContrato] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [data, setData] = useState<Recibo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate(); 
  
  useEffect(() => {
    const fetchData = async () => {
      if (cod_emp) { 
        try {
          console.log(cod_emp);
          const response = await axios.get(`${apiUrl}/recibos/${cod_emp}`);
          setData(response.data);
        } catch (error) {
          console.error('Error al cargar la informacion de los recibo de pago', error);
          setError('Error al cargar la informacion de los recibo de pago');
        }
      }
    };

    fetchData();
  }, [cod_emp]); 

  const monthNameToNumber = (monthName: string): number => {
    const months = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    return months.indexOf(monthName.toLowerCase()) + 1;
  };

  const sortedData = [...data].sort((a: Recibo, b: Recibo) => {
    if (sortConfig.key) {
      let aValue = a[sortConfig.key as keyof Recibo];
      let bValue = b[sortConfig.key as keyof Recibo];

      if (sortConfig.key === 'Mes') {
        aValue = monthNameToNumber(a.Mes);
        bValue = monthNameToNumber(b.Mes);
      }

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
    item.reci_num.toString().includes(searchReciNum) &&
    item.AÑIO.toString().includes(searchAnio) &&
    item.Mes.toLowerCase().includes(searchMes.toLowerCase()) &&
    item.Contrato.toLowerCase().includes(searchContrato.toLowerCase())
  );

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleViewClick = (reci_num: number) => {
    navigate(`/RecibodePago/${reci_num}`);
  };

  return (
    <>
      <div className="canvas">
        <h1>Recibo de Pago</h1>
        <br/>
        {error && <Alert variant="danger" onClose={()=> setError(null)}  dismissible><AlertHeading>Error <hr/></AlertHeading>{error}</Alert>}
        <br/>
        <div className='tableRecibo'>
        <Table striped bordered hover responsive >
          <thead>
              <th>
                  <Form.Control
                      className='search'
                      type="text"
                      placeholder="Buscar por Número..."
                      value={searchReciNum}
                      onChange={(e) => setSearchReciNum(e.target.value)}
                  />
              </th>
              <th>
                  <Form.Control
                      className='search'
                      type="text"
                      placeholder="Buscar por Año..."
                      value={searchAnio}
                      onChange={(e) => setSearchAnio(e.target.value)}
                  />
              </th>
              <th>
                  <Form.Control
                      className='search'
                      type="text"
                      placeholder="Buscar por Mes..."
                      value={searchMes}
                      onChange={(e) => setSearchMes(e.target.value)}
                  />
              </th>
              <th>
                  <Form.Control
                      className='search'
                      type="text"
                      placeholder="Buscar por Tipo..."
                      value={searchContrato}
                      onChange={(e) => setSearchContrato(e.target.value)}
                  />
              </th>
          </thead>
          <thead>
            <tr>
              <th id='headTable' onClick={() => requestSort('reci_num')} className='titulo'>
                Nº Recibo
                {sortConfig.key === 'reci_num' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th id='headTable' onClick={() => requestSort('AÑIO')} className='titulo'>
                Año
                {sortConfig.key === 'AÑIO' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th id='headTable' onClick={() => requestSort('Mes')} className='titulo'>
                Mes
                {sortConfig.key === 'Mes' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th id='headTable' onClick={() => requestSort('Contrato')} className='titulo'>
                Tipo de Recibo
                {sortConfig.key === 'Contrato' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th id='headTable'></th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map(item => (
              <tr key={item.reci_num}>
                <td>{item.reci_num}</td>
                <td>{item.AÑIO}</td>
                <td>{item.Mes}</td>
                <td>{item.Contrato}</td>
                <td>
                  <Button variant="primary" onClick={() => handleViewClick(item.reci_num)}>Ver</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        </div>
      </div>
    </>
  );
}

export default TableRecibodePago;