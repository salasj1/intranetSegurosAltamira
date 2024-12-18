import jsPDF from 'jspdf';
import logo from "../assets/logo-head.png";
import marca from "../assets/marca.png";
import firmaaprueba from "../assets/firmaprueba.png";
import CalibriBase64 from '../fonts/Calibri.base64.ts';
import { addDays } from 'date-fns';
const generateConstanciaPDF = (data: any, destinatario: string) => {
  try {
    const doc = new jsPDF('p', 'mm', 'letter');
    if (!data || !data[0]) {
      console.error('Datos inválidos para generar el PDF');
      return doc;
    }
    doc.addFileToVFS('calibri.ttf', CalibriBase64);
    doc.addFont('calibri.ttf', 'calibri', 'normal');
    
    // Logo de la empresa
  doc.addImage(logo, 'PNG', 16, 14, 25.45, 27.27);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text(" J-30052236-9", 17, 45);
  doc.setFontSize(12);
  doc.setFontSize(13);
  doc.setFont('calibri', 'normal');
  
  doc.text(`Señores.\n${destinatario}\nPresente.`, 15, 55);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bolditalic');
  doc.text("CONSTANCIA DE TRABAJO", doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' });
  doc.setFontSize(12);
  doc.setFont('calibri', 'normal');
  let y=100;
  doc.text("                    Quien suscribe, hace constar que el Trabajador identificado a continuación, mantiene\n una relación laboral bajo las siguientes condiciones:", 15, y);
  let yDatos=120;
  doc.text(`Apellidos y Nombres:    ${data[0].nombre_completo}`, 17, yDatos);
  doc.text(`Cédula de Identidad:     ${data[0].cedula}`, 17, yDatos+10);
  const fecha_ingreso =addDays((data[0].fecha_ing),1);
  
  const formattedFechaIngreso = `${fecha_ingreso.getDate().toString().padStart(2, '0')}/${(fecha_ingreso.getMonth() + 1).toString().padStart(2, '0')}/${fecha_ingreso.getFullYear()}`;
  doc.text(`Fecha de Ingreso:           ${formattedFechaIngreso}`, 17, yDatos+20);
  doc.text(`Cargo:                               ${data[0].des_cargo}`, 17, yDatos+30);
  doc.text(`Departamento:               ${data[0].des_depart}`, 17, yDatos+40);
  let yParrafo2=yDatos+55;
  if(data[0].sueldoBase){
    doc.text(`Sueldo Base:                    ${data[0].sueldoBase.toString()} `, 17, yDatos+50);
    yParrafo2=yDatos+65;
  }
  const fecha = new Date();
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const formattedFecha = `${fecha.getDate()} días del mes de ${months[fecha.getMonth()]} de ${fecha.getFullYear()}.`;
  const maxWidth = 170;
  const splitText = doc.splitTextToSize(`             Constancia que se expide a petición de la parte interesada, en Caracas a los ${formattedFecha}`, maxWidth);
  doc.text(splitText, 17, yParrafo2);
  
 
  doc.line(65, yParrafo2+37.5, doc.internal.pageSize.getWidth() - 65, yParrafo2+37.5);
  doc.addImage(marca, 'PNG', doc.internal.pageSize.getWidth() / 2-15, yParrafo2, 50, 50);
  doc.addImage(firmaaprueba, 'PNG', doc.internal.pageSize.getWidth() / 2-30, yParrafo2+17, 60, 30);
  doc.setFontSize(12);
  doc.text("Atentamente,", doc.internal.pageSize.getWidth() / 2, yParrafo2+15, { align: 'center' });
  doc.setFont('helvetica', 'bold');
  doc.text("SEGUROS ALTAMIRA, C.A.", doc.internal.pageSize.getWidth() / 2, yParrafo2+22, { align: 'center' });
  doc.setFont('calibri', 'normal');
  doc.text("SORAIMA ZAMBRANO", doc.internal.pageSize.getWidth() / 2, yParrafo2+43, { align: 'center' });
  doc.text("GERENCIA CAPITAL HUMANO", doc.internal.pageSize.getWidth() / 2, yParrafo2+51, { align: 'center' });
  
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.line(15, pageHeight - 30, doc.internal.pageSize.getWidth() - 15, pageHeight - 30);
  doc.setFontSize(9);
  doc.text("Libertador con Calle Negrín, C.C. Av. Libertador, PH, 3er, 2do y 1er piso, Urb. La Florida. Caracas - Venezuela. Master: (0212) 705.90.00", doc.internal.pageSize.getWidth() / 2, pageHeight - 25, { align: 'center' });
  doc.text("Fax: (0212) 705.93.98. HCM (0212) 762.43.43 FIANZAS (0212) 740.57.10. PRODUCCION (0212) 762.99.40. Seguros Altamira C.A.", doc.internal.pageSize.getWidth() / 2, pageHeight - 20, { align: 'center' });
  doc.text("www.segurosaltamira.com", doc.internal.pageSize.getWidth() / 2, pageHeight - 15, { align: 'center' });
  
  
  
  doc.setFontSize(12);

/*   doc.text(`Fecha: ${formattedFecha}`, 220, 17); */
     
     
   

    

    
    
  /* doc.text(`Empleado: ${(data[0].cod_emp || 'N/A').toUpperCase()}`, 17, 60);
  doc.text(`Nombres: ${(data[0].nombre_completo || 'N/A').toUpperCase()}`, 80, 60);
  const fechaIngreso = new Date(data[0].fecha_ing);
  const formattedFechaIngreso = `${fechaIngreso.getDate()}/${fechaIngreso.getMonth() + 1}/${fechaIngreso.getFullYear()}`;
  doc.text(`Fecha Ingreso: ${formattedFechaIngreso}`, 210, 60);
  doc.text(`Unidad: ${(data[0].des_depart || 'N/A').toUpperCase()}`, 17, 68); */

    
   
    

    



    
    


    
    return doc;
  } catch (error) {
    console.error('Error generando el PDF:', error);
    throw error;
  }
};

export default generateConstanciaPDF;