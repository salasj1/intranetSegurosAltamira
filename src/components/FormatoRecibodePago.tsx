import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/logo-head.png";
import ArialNarrowBase64 from '../fonts/ArialNarrow.Base64'; 
import CalibriBase64 from '../fonts/Calibri.base64';

const generatePDF = (data: any) => {
  try {
    const doc = new jsPDF('landscape', 'px', 'letter', true);

    if (!data || !data[0]) {
      console.error('Datos inválidos para generar el PDF');
      return doc;
    }

    const addHeader = (pageNumber: number, totalPages?: number) => {
      // CUADRO DE DATOS DE LA EMPRESA
      const posrecx = 12;
      const posrecy = 10;
      const posrecw = 560;
      const posrech = 50;
      doc.setLineWidth(1); // Set the line width to make the rectangle borders thicker
      doc.setDrawColor(0, 0, 0); // Set the draw color to black
      doc.rect(posrecx, posrecy, posrecw, posrech);

      // Agregar imagen del logo
      doc.addImage(logo, 'PNG', posrecx + 6, posrecy + 6, 40, 40);

      // Registrar la fuente Arial Narrow
      doc.addFileToVFS('ArialNarrow.ttf', ArialNarrowBase64);
      doc.addFileToVFS('Calibri.ttf', CalibriBase64);
      doc.addFont('ArialNarrow.ttf', 'ArialNarrow', 'normal');
      doc.addFont('Calibri.ttf', 'Calibri', 'normal');
      doc.addFont('CalibriBold.ttf', 'CalibriBold', 'bold');
      // Información de la empresa
      doc.setFontSize(11);
      doc.text('Profit Plus Nómina', posrecx + 56, posrecy + 15);
      doc.text('Seguros Altamira, C.A', posrecx + 56, posrecy + 27);
      doc.text('RIF.: J-30052236-9', posrecx + 56, posrecy + 39);

      // Información de Pagina y nombre persona
      const firstName = data[0].nombres ? data[0].nombres.split(' ')[0] : 'N/A';
      const firstlastName = data[0].nombres ? data[0].nombres.split(' ')[1] : 'N/A';
      doc.setFontSize(12);
      doc.text(`Usuario:`, posrecw - 175, posrecy + 10);
      doc.text(`${firstName} ${firstlastName}`, posrecw - 75, posrecy + 10);
      if (totalPages) {
        doc.text('Página:', posrecw - 173, posrecy + 20);
        doc.text(` ${pageNumber}      de                ${totalPages}`, posrecw - 90, posrecy + 20);
      } else {
        doc.text(`Página: ${pageNumber}`, 250, 24);
      }
      doc.text(`Fecha:`, posrecw - 175, posrecy + 30);
      doc.text(`${new Date().toLocaleDateString()}`, posrecw - 119, posrecy + 30);
      const formatTime = (date: Date) => {
        let hours = date.getHours();
        const minutes = date.getMinutes();
        const seconds = date.getSeconds();
        const ampm = hours >= 12 ? 'p.m.' : 'a.m.';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const strMinutes = minutes < 10 ? '0' + minutes : minutes;
        const strSeconds = seconds < 10 ? '0' + seconds : seconds;
        return `${hours}:${strMinutes}:${strSeconds}${ampm}`;
      };
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0); // Set text color to black
      doc.text(`${formatTime(new Date())}`, posrecw - 40, posrecy + 30);

      // CUADRO FECHA DE EMISION
      const posrecy2 = posrecy + posrech;
      const posrech2 = 20;
      doc.rect(posrecx, posrecy2, posrecw, posrech2);
      doc.setFontSize(12);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Fecha:    `, posrecx + 5, posrecy2 + 14);
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${data[0].fec_emis || 'N/A'}`, posrecx + 38, posrecy2 + 14);
      doc.setFontSize(10);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`N  Recibo: `, posrecw - 170, posrecy2 + 14);
      doc.setFont('ArialNarrow', 'bold');
      doc.text(`°`, posrecw - 160, posrecy2 + 14);
      doc.setFontSize(13);
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${data[0].reci_num || 'N/A'}`, posrecw - 80, posrecy2 + 14);

      // CUADRO DE DATOS DEL USUARIO
      const posrecy3 = posrecy2 + posrech2;
      const posrech3 = 50;
      doc.rect(posrecx, posrecy3, posrecw, posrech3);
      doc.setFont('CalibriBold', 'bold');
      doc.setFontSize(10);
      doc.text(`Trabajador:`, posrecx + 3, posrecy3 + 15);
      doc.setFontSize(14);
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${data[0].cod_emp || 'N/A'}`, posrecx + 45, posrecy3 + 15);
      doc.setFontSize(12);
      doc.text(`${(data[0].nombre_completo || 'N/A').toUpperCase()}`, posrecx + 100, posrecy3 + 15);
      doc.setFontSize(10);
      doc.text(`CÉDULA: ${data[0].ci || 'N/A'}`, posrecw / 2 + 20, posrecy3 + 15);
      doc.setTextColor(0, 0, 0);
      doc.setFont('CalibriBold', 'bold');
      doc.setFontSize(10);
      doc.text(`Cargo: `, posrecw - 160, posrecy3 + 15);
      doc.setFont('ArialNarrow', 'normal');
      doc.setFontSize(12);
      doc.text(`${(data[0].des_cargo).toUpperCase() || 'N/A'}`, posrecw - 130, posrecy3 + 15);
      doc.setTextColor(0, 0, 0);
      doc.setFont('CalibriBold', 'bold');
      doc.setFontSize(10);
      doc.text(`Sueldo Mensual: `, posrecx + 5, posrecy3 + 30);
      doc.setFont('ArialNarrow', 'normal');
      doc.setFontSize(12);
      doc.text(`${data[0].SueldoMensVar || 'N/A'}`, posrecx + 80, posrecy3 + 30);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Fecha Ingreso: `, posrecw / 2 - 100, posrecy3 + 30);

      const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      };
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${data[0].fecha_ing ? formatDate(data[0].fecha_ing) : 'N/A'}`, posrecw / 2 - 30, posrecy3 + 30);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Departamento `, posrecw - 160, posrecy3 + 30);
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${(data[0].Departamento).toUpperCase() || 'N/A'}`, posrecw - 100, posrecy3 + 30);

      // TABLA DE DATOS
      const tableData = data.map((item: any) => {
        const valorAuxiliar = item.auxi_cha || item.auxi_num !== 0 ? `${item.auxi_num} ${item.auxi_cha || ''}` : '';
        return [
          item.co_conce,
          item.des_conce,
          valorAuxiliar,
          item.tipo === 1 ? item.monto : '',
          item.tipo === 2 || item.tipo === 3 ? item.monto : ''
        ];
      });

      const posrecy4 = posrecy3 + posrech3;
      autoTable(doc, {
        head: [['Código', 'Descripción', 'VALOR AUXILIAR', 'Asignaciones', 'Deducciones']],
        body: tableData,
        startY: posrecy4,
        margin: { left: 12 }, // Adjust the right margin to make the table wider
        tableWidth: 560, // Set table width to auto to use the available space
        theme: 'plain',
        styles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0],
          lineWidth: 1,
          fontSize: 10, 
        },
        headStyles: {
          lineColor: [0, 0, 0],
          fontStyle: 'normal',
          lineWidth: 1,
          fontSize: 10, 
        },
        columnStyles: {
          0: { cellWidth: 'auto' }, // Adjust column width if needed
          1: { cellWidth: 250 },
          2: { cellWidth: 70, halign: 'center' },
          3: { cellWidth: 90, halign: 'right' },
          4: { cellWidth: 90, halign: 'right' }
        },
      });

      // Información bancaria
      const finalY = (doc as any).autoTable.previous.finalY;
      doc.setFontSize(11);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Total Asignaciones & Deducciones`, 255, finalY + 10);

      const totalAsignaciones = data.filter((item: any) => item.tipo === 1).reduce((sum: number, item: any) => sum + item.monto, 0).toFixed(2);
      const totalDeducciones = data.filter((item: any) => item.tipo === 2 || item.tipo === 3).reduce((sum: number, item: any) => sum + item.monto, 0).toFixed(2);

      // TOTAL DE DEDUCCIONES
      autoTable(doc, {
        body: [[`${totalAsignaciones}`, `${totalDeducciones}`]],
        startY: finalY,
        theme: 'plain',
        tableWidth: 180,
        margin: { left: 392 }, // Adjust the left margin to move the table to the right
        styles: {
          fillColor: [255, 255, 255],
          textColor: [0, 0, 0],
          lineColor: [0, 0, 0], // Set the line color to transparent
          lineWidth: 1,
          fontSize: 10,
          halign: 'right',
        },
        headStyles: {
          lineColor: [255, 255, 255], // Set the line color to transparent
          lineWidth: 1,
          fontSize: 10, // Adjust font size if needed
        },
        columnStyles: {
          0: { cellWidth: 90, minCellHeight: 20 }, // Adjust column width if needed
          1: { cellWidth: 90 },
        }
      });

      // TOTAL A COBRAR TRABAJADOR
      doc.rect(250, finalY + 23, 322, 80);
      doc.setFontSize(12);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Total a Cobrar del Trabajador:    `, 280, finalY + 40);
      doc.text(`${data[0].NetoPagar || 'N/A'}`, 410, finalY + 40);
      doc.setFontSize(11);
      doc.text(`BANCO: `, 270, finalY + 70);
      doc.setFontSize(12);
      doc.setFont('ArialNarrow', 'normal');
      doc.text(`${data[0].Banco || 'N/A'}`, 320, finalY + 70);
      doc.setFont('CalibriBold', 'bold');
      doc.setFontSize(11);
      doc.text(`CUENTA: `, 270, finalY + 90);
      doc.setFont('ArialNarrow', 'normal');
      doc.setFontSize(12);
      doc.text(`${data[0].CtaBancaria || 'N/A'}`, 320, finalY + 90);

      // CUADRO DE FIRMA
      doc.rect(10, finalY + 10, 230, 70);
      doc.setFontSize(11);
      doc.setFont('CalibriBold', 'bold');
      doc.text(`Recibí Conforme:`, 20, finalY + 100);
      doc.setFont('ArialNarrow', 'bold');
      doc.text(`í`, 41, finalY + 100);
      doc.line(90, finalY + 98, 240, finalY + 98);
    };

    // Obtener el número total de páginas
    const totalPages = doc.internal.pages.length - 1;

    // Volver a agregar encabezados con el número total de páginas
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      addHeader(i, totalPages);
    }

    return doc;
  } catch (error) {
    console.error('Error generando el PDF:', error);
    throw error;
  }
};

export default generatePDF;