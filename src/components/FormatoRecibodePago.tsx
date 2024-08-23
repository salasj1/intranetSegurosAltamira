import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/logo-head.png";

const generatePDF = (data: any) => {
  try {
    
      /* const doc = new jsPDF('landscape', 'px', 'letter', true); */
      const doc = new jsPDF();
      if (!data || !data[0]) {
          console.error('Datos inválidos para generar el PDF');
          return doc;
      }
      // Agregar imagen del logo
      doc.addImage(logo, 'PNG', 14, 10, 30, 30);

      // Título del documento
      doc.setFontSize(20);
      doc.text('Recibo de Pago', 75, 40);

      // Información de la empresa
      doc.setFontSize(11);
      doc.text('Seguros Altamira, C.A', 14, 50);
      doc.text('RIF.: J-30052236-9', 14, 55);

      // Información del usuario
      
      doc.text(`Nombre Completo: ${data[0].nombre_completo || 'N/A'}`, 14, 65);
      doc.text(`Cédula de Identidad: ${data[0].ci || 'N/A'}`, 14, 70);
      doc.text(`Cargo: ${data[0].des_cargo || 'N/A'}`, 14, 75);
      doc.text(`Fecha de Ingreso: ${data[0].fecha_ing ? new Date(data[0].fecha_ing).toLocaleDateString() : 'N/A'}`, 14, 80);
      doc.text(`Departamento: ${data[0].Departamento || 'N/A'}`, 14, 85);

      // Información del recibo
      doc.text(`Número de Recibo: ${data[0].reci_num || 'N/A'}`, 14, 95);
      doc.text(`Fecha de Emisión: ${data[0].fec_emis || 'N/A'}`, 14, 100);

      // Sueldo Mensual
      doc.text(`Sueldo Mensual: ${data[0].SueldoMensVar || 'N/A'}`, 14, 125);

      // Tabla de asignaciones y deducciones
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

      const totalAsignaciones = data.filter((item: any) => item.tipo === 1).reduce((sum: number, item: any) => sum + item.monto, 0);
      const totalDeducciones = data.filter((item: any) => item.tipo === 2 || item.tipo === 3).reduce((sum: number, item: any) => sum + item.monto, 0);

      tableData.push(['', '', 'Total de Asignaciones y Deducciones', totalAsignaciones, totalDeducciones]);

      autoTable(doc, {
          head: [['Código', 'Descripción', 'Valor Auxiliar', 'Asignaciones', 'Deducciones']],
          body: tableData,
          startY: 130,
      });

      // Totales
      doc.text(`Total a Cobrar del Trabajador: ${data[0].NetoPagar || 'N/A'}`, 14, (doc as any).lastAutoTable.finalY + 10);

      // Información bancaria
      doc.text(`Banco: ${data[0].Banco || 'N/A'}`, 14, 110);
      doc.text(`Cuenta Bancaria: ${data[0].CtaBancaria || 'N/A'}`, 14, 115);

      return doc;
  } catch (error) {
      console.error('Error generando el PDF:', error);
      throw error;
  }
};
export default generatePDF;