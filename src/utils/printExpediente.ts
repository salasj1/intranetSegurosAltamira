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

export const printExpediente = (
  datosPersonales: DatosPersonales | null,
  rutas: RutaSolicitud[],
  archivos: Archivo[],
  palabrasClaveDict: Record<string, string>,
  parseArchivoNombre: (nombre: string) => { tipo: string; fechaCarga: string; fechaVencimiento: string; nombreArchivo: string; }
) => {
  if (!datosPersonales) return;
  const printWindow = window.open('', '', 'width=900,height=700');
  if (!printWindow) return;
  const rutogramaHtml = rutas.length === 0 ? '' : `
    <h2>Rutograma</h2>
    <table border="1" style="width:100%;border-collapse:collapse;">
      <thead>
        <tr><th>Tipo</th><th>Descripción</th><th>Estatus</th></tr>
      </thead>
      <tbody>
        ${rutas.map(ruta => `
          <tr>
            <td>${ruta.tipo === 'I' ? 'Destino a la oficina' : ruta.tipo === 'R' ? 'Regreso a la Casa' : 'Otro'}</td>
            <td>${ruta.descripcion}</td>
            <td>${ruta.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>`;
  const archivosHtml = archivos.length === 0 ? `` : `
    <h2>Archivos</h2>
    <table border="1" style="width:100%;border-collapse:collapse;">
      <thead>
        <tr><th>Tipo de documento</th><th>Nombre</th><th>Fecha de carga</th><th>Fecha de vencimiento</th></tr>
      </thead>
      <tbody>
        ${archivos.map(arch => {
          const { tipo, fechaCarga, fechaVencimiento, nombreArchivo } = parseArchivoNombre(arch.name);
          return `<tr>
            <td>${palabrasClaveDict[tipo] || tipo || 'Desconocido'}</td>
            <td>${nombreArchivo}</td>
            <td>${fechaCarga || '-'}</td>
            <td>${fechaVencimiento || '-'}</td>
          </tr>`;
        }).join('')}
      </tbody>
    </table>`;
  printWindow.document.write(`
    <html><head><title>Expediente de ${datosPersonales.nombres} ${datosPersonales.apellidos}</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      h2 { color: #003391; }
      table { margin-bottom: 24px; }
      th, td { padding: 8px; }
    </style>
    </head><body>
      <img id="logo-print" src="/assets/logo-head.png" alt="Logo" style="width: 100px; height: auto;" />
      <h2>Datos Personales</h2>
      <div><b>Nombre:</b> ${datosPersonales.nombres} ${datosPersonales.apellidos}</div>
      <div><b>Cargo:</b> ${datosPersonales.cargo}</div>
      <div><b>Departamento:</b> ${datosPersonales.departamento}</div>
      <div><b>Fecha de Ingreso:</b> ${datosPersonales.fecha_ing?.split('T')[0]}</div>
      <div><b>Fecha de Nacimiento:</b> ${datosPersonales.fecha_nac?.split('T')[0]}</div>
      <div><b>Cédula:</b> ${datosPersonales.ci}</div>
      <div><b>RIF:</b> ${datosPersonales.rif}</div>
      <div><b>Estado Civil:</b> ${{
        S: "Soltero",
        C: "Casado",
        D: "Divorciado",
        V: "Viudo"
      }[datosPersonales.edo_civ] || "Desconocido"}</div>
      <div><b>Email:</b> ${datosPersonales.correo_e}</div>
      <div><b>Teléfono:</b> ${datosPersonales.telefono}</div>
      <div><b>Dirección:</b> ${datosPersonales.direccion}</div>
      <hr/>
      ${rutogramaHtml}
      ${archivosHtml}
    </body></html>
  `);
  printWindow.document.close();

  // Esperar a que el logo cargue antes de imprimir
  printWindow.onload = function () {
    const logoImg = printWindow.document.getElementById('logo-print') as HTMLImageElement;
    if (logoImg && !logoImg.complete) {
      logoImg.onload = () => {
        printWindow.focus();
        printWindow.print();
      };
    } else {
      printWindow.focus();
      printWindow.print();
    }
  };
};
