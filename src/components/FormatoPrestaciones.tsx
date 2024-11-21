import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/logo-head.png";

const generatePrestacionesPDF = (data: any) => {
  try {
    const doc = new jsPDF('landscape');
    if (!data || !data[0]) {
      console.error('Datos inválidos para generar el PDF');
      return doc;
    }

    // Función para agregar encabezado en cada página
    const addHeader = (pageNumber: number, totalPages?: number) => {
      doc.addImage(logo, 'PNG', 14, 10, 30, 30);
      doc.setFontSize(14);
      doc.text("Seguros Altamira, C.A.", 45, 17);
      doc.text("RIF: J-30052236-9", 45, 24);
      doc.text("Capital Humano", 45, 31);
      // Fecha del documento
      const fecha = new Date();
      const formattedFecha = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
      let formattedHora = `${fecha.getHours()}:${fecha.getMinutes().toString().padStart(2, '0')} ${fecha.getHours() >= 12 ? 'pm' : 'am'}`;
      if (fecha.getHours() >= 12) {
        formattedHora = `${(fecha.getHours() - 12).toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} pm`;
      } else {
        formattedHora = `${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')} am`;
      }
      
      doc.setFontSize(12);

      doc.text(`Fecha: ${formattedFecha}`, 220, 17);
      doc.text(`${formattedHora}`, 260, 17);
      // Número de página
      
      if (totalPages) {
        doc.text(`Página: ${pageNumber} de ${totalPages}`, 250, 24);
      } else {
        doc.text(`Página: ${pageNumber}`, 250, 24);
      }
    };

    // Agregar encabezado en la primera página
    addHeader(1);

    // Título del documento
    doc.setFontSize(20);
    doc.text('INTERESES SOBRE PRESTACIONES SOCIALES', 75, 45);

    // Línea horizontal
    doc.setLineWidth(0.5);
    doc.setDrawColor(0, 56, 150);
    doc.setLineWidth(1);
    doc.line(14, 50, doc.internal.pageSize.getWidth() - 14, 50);

    // Información del usuario
    doc.setFontSize(11);
    doc.setDrawColor(0);
    doc.setLineWidth(0.1);
    doc.rect(13, 55, 270, 15, 'S');
    doc.text(`Empleado: ${(data[0].cod_emp || 'N/A').toUpperCase()}`, 17, 60);
    doc.text(`Nombres: ${(data[0].nombre_completo || 'N/A').toUpperCase()}`, 80, 60);
    const fechaIngreso = new Date(data[0].fecha_ing);
    const formattedFechaIngreso = `${fechaIngreso.getDate()}/${fechaIngreso.getMonth() + 1}/${fechaIngreso.getFullYear()}`;
    doc.text(`Fecha Ingreso: ${formattedFechaIngreso}`, 210, 60);
    doc.text(`Unidad: ${(data[0].des_depart || 'N/A').toUpperCase()}`, 17, 68);

    
    // Tabla de movimientos de prestaciones sociales
    const tableData = data.map((item: any) => [
      item.AÑO,
      item.MES,
      item.sueldo_mensual,
      item.porcion_utilidad,
      item.porcion_vacacion,
      item.sueldo_integral,
      item.dias_antiguiedad,
      item.antiguedad_mensual,
      item.Adelantos,
      item.neto_prestaciones,
      item.porc_interes,
      item.interes
    ]);

    
    // Calcular totales
    const totalPrestacionesAcumuladas = data.reduce((acc: number, item: any) => acc + item.antiguedad_mensual, 0);
    const totalInteres = data.reduce((acc: number, item: any) => acc + item.interes, 0);
    const totalAnticiposOtorgados = data.reduce((acc: number, item: any) => acc + item.Adelantos, 0);

    const totalPrestacionesNetas = totalPrestacionesAcumuladas+totalAnticiposOtorgados;
    const totalDisponibles = totalPrestacionesNetas * 0.75;
    autoTable(doc, {
      head: [['Año', 'Mes', 'Sueldo Mensual', 'Sueldo Diario', 'Alicuota Bono Vac', 'Salario Integral', 'Días Prest.', 'Antigüedad Mensual', 'Anticipos Otorgados', 'Neto Prestaciones', 'Tasa', 'Monto Interés']],
      body: tableData,
      startY: 75,
      margin: { top: 50 }, // Ajustar el margen superior para las páginas adicionales
      didDrawPage: (data) => {
      // Agregar encabezado en cada nueva página
      if (data.pageNumber > 1) {
        addHeader(data.pageNumber);
      }
      },
      styles: {
      fillColor: [255, 255, 255], // Set background color of head cells to white
      textColor: [0, 0, 0],
      lineColor: [0, 0, 0], // Set border color of cells to black
      lineWidth: 0.5, // Set border width of cells to 0.5
      valign: 'middle', // Set vertical alignment of content to middle
      halign: 'right' // Set horizontal alignment of content to right
      }
    });

    // Agregar página nueva
    doc.addPage();

    // Dibujar rectángulo
    const rectX = 14;
    const rectY = 40;
    const rectWidth = doc.internal.pageSize.getWidth() - 24;
    const rectHeight = 25;
    const rectMarginTop = 10;
    doc.setDrawColor(0);
    doc.setFillColor(255, 255, 255);
    doc.rect(rectX, rectY + rectMarginTop, rectWidth, rectHeight, 'FD');

    // Escribir totales dentro del rectángulo
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Total Prestaciones Acumuladas:', rectX + 2, rectY + rectMarginTop + 10);
    doc.text(totalPrestacionesAcumuladas.toFixed(2), rectX + 70, rectY + rectMarginTop + 10);

    doc.text('Total Prestaciones Netas:', rectX + 136, rectY + rectMarginTop + 10);
    doc.text(totalPrestacionesNetas.toFixed(2), rectX + 195, rectY + rectMarginTop + 10);

    doc.text('Total Anticipos Otorgados:', rectX + 13, rectY + rectMarginTop + 20);
    doc.text(totalAnticiposOtorgados.toFixed(2), rectX + 70, rectY + rectMarginTop + 20);

    doc.text('Total Disponibles (Netas * 75%):', rectX + 136, rectY + rectMarginTop + 20);
    doc.text(totalDisponibles.toFixed(2), rectX + 205, rectY + rectMarginTop + 20);

    doc.text('Total Interés:', rectWidth - 15, rectY + rectMarginTop + 10);
    doc.text(totalInteres.toFixed(2), rectWidth - 2, rectY + rectMarginTop + 20);

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

export default generatePrestacionesPDF;