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

library.add(faArrowDown, faArrowUp);

interface Recibo {
  reci_num: number;
  cod_emp: string;
  AÑIO: number;
  Mes: string;
  Contrato: string;
}

function TableEmpresa() {
  const { cod_emp } = useAuth(); 
  const [searchReciNum, setSearchReciNum] = useState('');
  const [searchAnio, setSearchAnio] = useState('');
  const [searchMes, setSearchMes] = useState('');
  const [searchContrato, setSearchContrato] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: '', direction: 'asc' });
  const [data, setData] = useState<Recibo[]>([]);
  const navigate = useNavigate(); // Usa useNavigate

  useEffect(() => {
    const fetchData = async () => {
      if (cod_emp) { 
        try {
          console.log(cod_emp);
          const response = await axios.get(`/api/recibos/${cod_emp}`);
          setData(response.data);
        } catch (error) {
          console.error('Error fetching data', error);
        }
      }
    };

    fetchData();
  }, [cod_emp]); 

  const sortedData = [...data].sort((a: Recibo, b: Recibo) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key as keyof Recibo];
      const bValue = b[sortConfig.key as keyof Recibo];
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

  return (
    <>
      <div className="canvas">
        <h1>Recibo de Pago</h1>
        
        <Table striped bordered hover responsive>
          <thead>
              <th>
                  <input
                      className='search'
                      type="text"
                      placeholder="Buscar por Número..."
                      value={searchReciNum}
                      onChange={(e) => setSearchReciNum(e.target.value)}
                  />
              </th>
              <th>
                  <input
                      className='search'
                      type="text"
                      placeholder="Buscar por Año..."
                      value={searchAnio}
                      onChange={(e) => setSearchAnio(e.target.value)}
                  />
              </th>
              <th>
                  <input
                      className='search'
                      type="text"
                      placeholder="Buscar por Mes..."
                      value={searchMes}
                      onChange={(e) => setSearchMes(e.target.value)}
                  />
              </th>
              <th>
                  <input
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
              <th onClick={() => requestSort('reci_num')} className='titulo'>
                Nº Recibo
                {sortConfig.key === 'reci_num' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('AÑIO')} className='titulo'>
                Año
                {sortConfig.key === 'AÑIO' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('Mes')} className='titulo'>
                Mes
                {sortConfig.key === 'Mes' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th onClick={() => requestSort('Contrato')} className='titulo'>
                Tipo de Recibo
                {sortConfig.key === 'Contrato' && (
                  <FontAwesomeIcon icon={sortConfig.direction === 'asc' ? 'arrow-down' : 'arrow-up'} />
                )}
              </th>
              <th></th>
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
                  <Button variant="primary" onClick={() => navigate(`/RecibodePago/${item.reci_num}`)}>Ver</Button>
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