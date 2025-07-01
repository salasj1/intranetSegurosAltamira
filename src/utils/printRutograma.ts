interface RutaSolicitud {
  id: number;
  cod_emp: string;
  tipo: string;
  descripcion: string;
  status: number;
}

export const printRutograma = (
  rutas: RutaSolicitud[],
  empleadoNombre?: string
) => {
  const printWindow = window.open('', '', 'width=900,height=700');
  if (!printWindow) return;
  const rutogramaHtml = rutas.length === 0 ? '<div>No hay rutas</div>' : `
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
  printWindow.document.write(`
    <html><head><title>Rutograma</title>
    <style>
      body { font-family: Arial, sans-serif; margin: 24px; }
      h2 { color: #003391; }
      table { margin-bottom: 24px; }
      th, td { padding: 8px; }
    </style>
    </head><body>
      <img id="logo-print" src="/assets/logo-head.png" alt="Logo" style="width: 100px; height: auto;" />
      <br />
      <br />
      ${empleadoNombre ? `<div style='margin-bottom:16px'><b>Empleado:</b> ${empleadoNombre}</div>` : ''}
      <h2>Rutograma</h2>
      ${rutogramaHtml}
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
