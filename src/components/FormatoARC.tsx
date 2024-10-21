import jsPDF from 'jspdf';

import autoTable from 'jspdf-autotable';
import ArialNarrowBase64 from '../fonts/ArialNarrow.Base64'; // Importa la cadena base64

const generateARCPDF = (data: any, fecha: string) => {
  try {
    const doc = new jsPDF( { orientation: 'p', unit: 'mm', format: 'letter' } );

    // Registrar la fuente Arial Narrow
    doc.addFileToVFS('ArialNarrow.ttf', ArialNarrowBase64);
    doc.addFont('ArialNarrow.ttf', 'ArialNarrow', 'normal');

    if (!data || !data[0]) {
      console.error('Datos inválidos para generar el PDF');
      return doc;
    }

    // Función para agregar encabezado en cada página
    doc.setFont('ArialNarrow'); // Usar la fuente registrada
    doc.setFontSize(10);
    
    const y = 15;
    const x = 15;
    doc.text("REPÚBLICA BOLIVARIANA DE VENEZUELA", x, y);
    doc.text("MINISTERIO DE FINANZAS", x, y + 5);
    doc.text("DIRECCION GENERAL", x, y + 10);
    doc.text("SECTORIAL DE RENTAS", x, y + 15);
    doc.text("COMPROBANTE DE RETENCIÓN (ARC)",(doc.internal.pageSize.getWidth()/2)-25, y + 13);
    doc.text(`Trabajador: Desde 01/01/2005 hasta 31/12/2024; Año: Desde ${(fecha || 'N/A')};`, (doc.internal.pageSize.getWidth()/2)-41, y + 18);
    // Línea horizontal
    doc.setLineWidth(0.35);
    doc.setDrawColor(0, 0, 0);
    doc.line(10, y + 27, doc.internal.pageSize.getWidth() - 10, y + 27);

    // Información del usuario
    const userInfoY = y + 33;
    doc.text(`BENEFICIARIO DE LA RETENCIÓN`, 17, userInfoY);
    doc.text(`Persona Natural.Apellidos y Nombres: ${(data[0].nombre_completo || 'N/A').toUpperCase()}`, 17, userInfoY + 5);
    doc.text(`Cédula de identidad: ${(data[0].cedula || 'N/A').toUpperCase()}`,(doc.internal.pageSize.getWidth()/2)+30 , userInfoY + 5);
    doc.text(`TIPO DE AGENTE DE RETENCIÓN`, 17, userInfoY + 12);
    doc.text(`Persona Juridica:Seguros Altamira, C.A.`, 17, userInfoY + 18);
    doc.text(`Nro. de RIF: `, (doc.internal.pageSize.getWidth()/2)+30, userInfoY + 18);
    doc.text(`J-30052236-9`, (doc.internal.pageSize.getWidth()/2)+57, userInfoY + 18);
    doc.text(`DIRECCION DEL AGENTE DE RETENCIÓN `, 17, userInfoY + 24);
    doc.text(`${data[0].direccion || 'N/A'}`,17, userInfoY + 30);
    doc.text(`CIUDAD: ${data[0].ciudad || 'N/A'}`, 17, userInfoY + 36);
    doc.text(`ESTADO: ${data[0].estado || 'N/A'}`, 90, userInfoY + 36);
    const telefono = data[0].telefono || 'N/A';
    const telefonoFormatted = telefono !== 'N/A' ? `(${telefono.slice(0, 4)}) ${telefono.slice(4, 7)} ${telefono.slice(7, 9)} ${telefono.slice(9)}` : telefono;
    doc.text(`TELÉFONO:  ${telefonoFormatted}`, 150, userInfoY + 36);
    
    // Mover la declaración de getMonthName aquí
    const getMonthName = (monthNumber: number) => {
      const monthNames = [
        'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
        'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'
      ];
      return monthNames[monthNumber - 1] || 'N/A';
    };

    // Tabla de movimientos de ARC
    const tableData = data.map((item: any) => [
      { content: getMonthName(item.mes), styles: { fontStyle: 'normal', fontSize: 10, halign: 'left',  } },
      item.Remuneracion || '',
      item.PorcentRetencion || '',
      item.ImpuestoRetenido || '',
      item.RemuneracionAcumulada || '',
      item.ImpuestoRetenidoAcum || ''
    ]);

    const tableY = userInfoY + 42;

    autoTable(doc, {
      head: [
      [
        { content: 'MESES', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center', valign:"top",  } },
        { content: 'REMUNERACIONES PAGADAS ABONADAS EN CUENTAS', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center' } },
        { content: 'PORCENTAJE DE RETENCION', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center', minCellWidth: -50 } },
        { content: 'IMPUESTO RETENIDO', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center'} },
        { content: 'REMUNERACIONES PAGADAS O ABONADAS EN CUENTAS ACUMULADAS', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center' } },
        { content: 'IMPUESTO RETENIDO ACUMULADO', styles: { fontStyle: 'normal', fontSize: 10, halign: 'center', minCellWidth: -10 } }
      ]
      ],
      tableId: 'arc-table',
      body: tableData,
      startY: tableY,
      margin: { top: 50, right: 8, left: 10 },
      styles: {
      fontSize: 10,
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0],
      lineWidth: 0.5,
      valign: 'middle',
      halign: 'right'
      },
      columnStyles:{
      0: { cellWidth: 28 },
      1: { cellWidth: 45 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 }
      },

      didDrawCell: (data: any) => {
      if (data.section === 'body' && data.row.index === data.table.body.length - 1) {
        data.cell.styles.lineWidth = 0; // Remove bottom border
        data.cell.styles.lineColor = [255, 255, 255]; // Set bottom border color to white
      }
      }
    });

    const Yfirmas = tableY + 150;

    doc.line((doc.internal.pageSize.getWidth()/2)-90, Yfirmas - 3, 70, Yfirmas - 3);
    doc.text(` Agente de Retención`, (doc.internal.pageSize.getWidth()/2)-80, Yfirmas+3);
    doc.text(`(Sello, Fecha, Firma)`, (doc.internal.pageSize.getWidth()/2)-79, Yfirmas+8);
    doc.line((doc.internal.pageSize.getWidth()/2)+30, Yfirmas - 3,(doc.internal.pageSize.getWidth()/2)+85, Yfirmas - 3);
    doc.text(`Para uso de la Administración de Hacienda`,(doc.internal.pageSize.getWidth()/2)+30, Yfirmas+3);


    return doc;
  } catch (error) {
    console.error('Error generando el PDF:', error);
    throw error;
  }

  
};

export default generateARCPDF;