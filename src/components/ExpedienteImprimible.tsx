import React from 'react';

interface DatosPersonales {
  cod_emp: string;
  nombres: string;
  apellidos: string;
  rif: string;
  edo_civ: string;
  correo_e: string;
  fecha_nac: string;
  telefono: string;
  direccion: string;
  ci: string;
  fecha_ing: string;
  cargo: string;
  departamento: string;
}
interface RutaSolicitud {
  id: number;
  cod_emp: string;
  tipo: string;
  descripcion: string;
  status: number;
}
interface Archivo {
  id: string;
  name: string;
  mimeType: string;
}

const palabrasClaveDict: Record<string, string> = {
  CertificadoAdministracionRiesgo: "Certificado Administración de Riesgo",
  ImpuestoSobreRenta: "Impuesto Sobre la Renta (ISLR)",
  Rif: "RIF",
  Cedula: "Cédula",
  DocumentosOtros: "Otros Documentos",
  ConstanciaResidencia: "Constancia de Residencia",
  SolicitudCedula: "Solicitud de Cédula"
};

function parseArchivoNombre(nombre: string) {
  const partes = nombre.replace('.pdf', '').split('_');
  let tipo = '', fechaCarga = '', fechaVencimiento = '', nombreArchivo = nombre;
  if (partes.length >= 3) {
    tipo = partes[1];
    fechaCarga = partes[2];
    if (partes.length >= 4) fechaVencimiento = partes[3];
    nombreArchivo = nombre;
  }
  return { tipo, fechaCarga, fechaVencimiento, nombreArchivo };
}

interface Props {
  datosPersonales: DatosPersonales;
  rutas: RutaSolicitud[];
  archivos: Archivo[];
}

const ExpedienteImprimible: React.FC<Props> = ({ datosPersonales, rutas, archivos }) => {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', margin: 24 }}>
      <h2 style={{ color: '#003391' }}>Datos Personales</h2>
      <div><b>Nombre:</b> {datosPersonales.nombres} {datosPersonales.apellidos}</div>
      <div><b>Cargo:</b> {datosPersonales.cargo}</div>
      <div><b>Departamento:</b> {datosPersonales.departamento}</div>
      <div><b>Fecha de Ingreso:</b> {datosPersonales.fecha_ing?.split('T')[0]}</div>
      <div><b>Fecha de Nacimiento:</b> {datosPersonales.fecha_nac?.split('T')[0]}</div>
      <div><b>Cédula:</b> {datosPersonales.ci}</div>
      <div><b>RIF:</b> {datosPersonales.rif}</div>
      <div><b>Estado Civil:</b> {{
        S: "Soltero",
        C: "Casado",
        D: "Divorciado",
        V: "Viudo"
      }[datosPersonales.edo_civ] || "Desconocido"}</div>
      <div><b>Email:</b> {datosPersonales.correo_e}</div>
      <div><b>Teléfono:</b> {datosPersonales.telefono}</div>
      <div><b>Dirección:</b> {datosPersonales.direccion}</div>
      <hr />
      <h2 style={{ color: '#003391' }}>Rutograma</h2>
      {rutas.length === 0 ? (
        <div>No hay rutas</div>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr><th>Tipo</th><th>Descripción</th><th>Estatus</th></tr>
          </thead>
          <tbody>
            {rutas.map(ruta => (
              <tr key={ruta.id}>
                <td>{ruta.tipo === 'I' ? 'Destino a la oficina' : ruta.tipo === 'R' ? 'Regreso a la Casa' : 'Otro'}</td>
                <td>{ruta.descripcion}</td>
                <td>{ruta.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <h2 style={{ color: '#003391' }}>Archivos</h2>
      {archivos.length === 0 ? (
        <div>No hay archivos</div>
      ) : (
        <table border={1} style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr><th>Tipo de documento</th><th>Nombre</th><th>Fecha de carga</th><th>Fecha de vencimiento</th></tr>
          </thead>
          <tbody>
            {archivos.map(arch => {
              const { tipo, fechaCarga, fechaVencimiento, nombreArchivo } = parseArchivoNombre(arch.name);
              return (
                <tr key={arch.id}>
                  <td>{palabrasClaveDict[tipo] || tipo || 'Desconocido'}</td>
                  <td>{nombreArchivo}</td>
                  <td>{fechaCarga || '-'}</td>
                  <td>{fechaVencimiento || '-'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ExpedienteImprimible;
