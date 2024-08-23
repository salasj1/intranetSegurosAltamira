import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logo from "../assets/logo-head.png";
import { useAuth } from '../auth/AuthProvider';

const generatePrestacionesPDF = (data: any) => {

    const {fecha_ing,cargo_empleado,des_depart} = useAuth();
  try {
      const doc = new jsPDF('landscape');
      if (!data || !data[0]) {
          console.error('Datos inválidos para generar el PDF');
          return doc;
      }
      // Agregar imagen del logo
      doc.addImage(logo, 'PNG', 14, 10, 30, 30);

      // Título del documento
      doc.setFontSize(20);
      doc.text('Intereses de Prestaciones Sociales', 75, 40);

      // Información del usuario
      doc.setFontSize(11);
      doc.text(`Empleado: ${data[0].cod_emp || 'N/A'}`, 14, 50);
      doc.text(`Nombres: ${data[0].nombre_completo || 'N/A'}`, 14, 55);
      doc.text(`Fecha Ingreso: ${fecha_ing || 'N/A'}`, 14, 60);
      doc.text(`Unidad: ${des_depart || 'N/A'}`, 14, 70);
      doc.text(`Año: ${data[0].AÑO || 'N/A'}`, 14, 75);
      doc.text(`Mes: ${data[0].MES || 'N/A'}`, 14, 80);

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

      autoTable(doc, {
          head: [[ 'Año', 'Mes', 'Sueldo Mensual', 'Porción Utilidad', 'Porción Vacación', 'Sueldo Integral', 'Días Antigüedad', 'Antigüedad Mensual', 'Adelantos', 'Neto Prestaciones', 'Porcentaje Interés', 'Interés']],
          body: tableData,
          startY: 70,
      });

      return doc;
  } catch (error) {
      console.error('Error generando el PDF:', error);
      throw error;
  }
};

export default generatePrestacionesPDF;