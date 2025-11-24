import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Noto_Sans } from '@/fonts/NotoSans-normal';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import { Button } from 'react-bootstrap';
import { Noto_Sans_Bold } from '@/fonts/NotoSans-bold';
import { TipoTransporte } from '@/types/rutograma.types';


// --- INTERFACES DE TYPESCRIPT ---
// Definen la estructura de los datos para mayor seguridad y claridad.

interface ActividadPDF {
    TipoActividad: number;
    otroTipoActividad: string | null;
    Descripcion: string;
    Ubicacion: string;
    TiempoAproximado: string;
    Frecuencia: string;
}

interface VehiculoSeleccionado {
    id_tipo_vehiculo: number;
    otro_tipo_vehiculo: string | null;
}

interface RutogramaDataPDF {
    Nombres: string;
    Apellidos: string;
    Cedula: string;
    Cargo: string;
    CentroTrabajo: string;
    DireccionEmpresa: string;
    DireccionHabitacion: string;
    Horario: string;
    ContactoEmergencia: string;
    
    // Ruta de Ida
    VehiculoIda: VehiculoSeleccionado[]; // <-- CAMBIO: Ahora es un array de objetos
    HoraSalida: string;
    EsAmIda: boolean;
    TiempoViajeIda: string;
    HaceEscalasIda: boolean;
    NumeroTransferenciasIda: number;
    DescripcionRutaIda: string;
    RutaAlternaIda: string;
    HaceActividadAntesIda: boolean;
    ActividadesIda?: ActividadPDF[];

    // Ruta de Regreso
    VehiculoRegreso:  VehiculoSeleccionado[]; // <-- CAMBIO: Ahora es un array de objetos
    HoraRegreso: string;
    EsAmRegreso: boolean;
    TiempoViajeRegreso: string;
    HaceEscalasRegreso: boolean;
    NumeroTransferenciasRegreso: number;
    DescripcionRutaRegreso: string;
    RutaAlternaRegreso: string;
    HaceActividadAntesRegreso: boolean;
    ActividadesRegreso?: ActividadPDF[];
}


interface ReporteRutogramaProps {
    rutogramaData:  RutogramaDataPDF  | null;
    tiposTransporte: TipoTransporte[];
    tiposActividad: { id: number; nombre: string }[];
}

/**
 * Componente de React (TSX) para generar y mostrar un reporte de Rutograma en PDF.
 * @param {ReporteRutogramaProps} props - Propiedades del componente.

 */
const ReporteRutograma: React.FC<ReporteRutogramaProps> = ({ rutogramaData,tiposTransporte, tiposActividad }) => {
    
    const [loading, setLoading] = useState<boolean>(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const zoomPluginInstance = zoomPlugin({
    enableShortcuts: true
});
    const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;


    useEffect(() => {
        if (!rutogramaData) {
            setLoading(false);
            return;
        }

        const generatePDF = () => {
            setLoading(true);
            try {
                const doc = new jsPDF('p', 'pt', 'letter');
                const margin: number = 40;
                const pageWidth: number = doc.internal.pageSize.getWidth();
                let pageHeight: number = doc.internal.pageSize.getHeight();
                const contentWidth: number = pageWidth - margin * 2;
                let currentY: number = margin;

                doc.addFileToVFS('NotoSans-normal.ttf', Noto_Sans);
                doc.addFont('NotoSans-normal.ttf', 'NotoSans', 'normal');
                doc.setFont('NotoSans');
                doc.addFileToVFS('NotoSans-bold.ttf', Noto_Sans_Bold);
                doc.addFont('NotoSans-bold.ttf', 'NotoSans', 'bold');
                
               
                const printHeader = () => {
                    doc.setFontSize(14);
                    doc.setFont('NotoSans', 'bold');
                    doc.text("DECLARACIÓN DE RUTA LABORAL", pageWidth / 2, currentY, { align: 'center' });
                    currentY += 18;
                    doc.text("HABITUAL DEL TRABAJADOR", pageWidth / 2, currentY, { align: 'center' });
                    currentY += 25;
                };

                // Al inicio del PDF
                
                printHeader();
                pageHeight = pageHeight - 120; // Ajustar altura para el fondo
                const margenHoja = 38;
                doc.rect(margenHoja, currentY - 10, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco

                doc.setFontSize(9);
                doc.setFont('NotoSans', 'normal');
                const introText: string = "Cumpliendo con lo establecido en la Ley Orgánica de Prevención, Condiciones y Medio Ambiente Trabajo (LOPCYMAT) en el Artículo 69 numeral 3 y con el fin de garantizar los derechos que otorga la mencionada Ley a los trabajadores y trabajadoras, se requiere que complete los datos solicitados a continuación:";
                const introLines: string[] = doc.splitTextToSize(introText, contentWidth);
                doc.text(introLines, margin, currentY);

                currentY += (introLines.length * 10) + 15;

                const drawSectionTitle = (title: string) => {
                    doc.setFontSize(11);
                    doc.setFont('NotoSans', 'normal');
                    doc.setFillColor(230, 230, 230);
                    doc.setDrawColor(0, 0, 0);
                    const ajuste= 2;
                    doc.rect(margin - ajuste, currentY - 12, contentWidth +(2*ajuste), 16, 'FD');
                    doc.setTextColor(50, 50, 50);
                    doc.text(title, pageWidth / 2, currentY, { align: 'center' });
                    currentY += 4;
                    doc.setTextColor(0, 0, 0);
                };
                
                

                /* const drawTextBox = (title: string, text: string, y: number, height: number) => {
                    doc.setFontSize(9);
                    doc.setFont('NotoSans', 'normal'); // <-- 2. Usar 'normal' en lugar de 'bold'
                    doc.text(title, margin, y);
                    doc.setFont('NotoSans', 'normal');
                    doc.rect(margin, y + 5, contentWidth, height);
                    const textLines = doc.splitTextToSize(text || '', contentWidth - 10);
                    doc.text(textLines, margin + 5, y + 18);
                }; */

                drawSectionTitle("Datos del Trabajador");
                autoTable(doc, {
                    startY: currentY ,
                    tableWidth: pageWidth - margenHoja * 2, // Limita el ancho de la tabla al área útil (margen)
                    margin: { left: margenHoja, right: margenHoja }, // Aplica el margen izquierdo y derecho
                    body: [
                        [
                            { content: 'Nombres y Apellidos:', styles: { fontStyle: 'bold' } },
                            { content: `${rutogramaData.Nombres} ${rutogramaData.Apellidos}` },
                            { content: 'Cédula:', styles: { fontStyle: 'bold' } },
                            rutogramaData.Cedula
                        ],
                        [
                            { content: 'Cargo actual:', styles: { fontStyle: 'bold' } },
                            rutogramaData.Cargo,
                            { content: 'Centro de trabajo:', styles: { fontStyle: 'bold' } },
                            rutogramaData.CentroTrabajo
                        ],
                        
                       
                    ],
                    styles: { font: 'NotoSans', fontSize: 9 },
                    columnStyles: {
                        0: { cellWidth: (pageWidth - margenHoja * 2) / 5 },
                        1: { cellWidth: (pageWidth - margenHoja * 2) / 2.45, overflow: 'linebreak' },
                        2: { cellWidth: (pageWidth - margenHoja * 2) / 5 },
                        3: { overflow: 'linebreak' },
                    },
                    useCss: true,
                    bodyStyles: { lineColor: [0, 0, 0]},
                    didDrawCell: function (data) {
                                // Encierra la celda 0 y 1 con un borde externo, pero omite la línea derecha de la celda 0
                        if ((data.row.index === 0 || data.row.index === 1)&& (data.column.index === 0 || data.column.index === 1)) {
                            const { cell } = data;
                            const x = cell.x;
                            const y = cell.y;
                            const w = cell.width;
                            const h = cell.height;
                            data.doc.setDrawColor(0, 0, 0);
                            if (data.column.index === 0) {
                                // Solo dibuja el borde izquierdo, superior e inferior (omite el derecho)

                                data.doc.line(x, y + h, x + w, y + h); // bottom
                            } else if (data.column.index === 1) {
                                // Dibuja todos los bordes normalmente

                                data.doc.line(x + w, y, x + w, y + h); // right
                                data.doc.line(x, y + h, x + w, y + h); // bottom
                            }
                        }
                        if ((data.row.index === 0 || data.row.index === 1)&& (data.column.index === 2 || data.column.index === 3)) {
                            const { cell } = data;
                            const x = cell.x;
                            const y = cell.y;
                            const w = cell.width;
                            const h = cell.height;
                            data.doc.setDrawColor(0, 0, 0);
                            if (data.column.index === 2) {
                                // Solo dibuja el borde izquierdo, superior e inferior (omite el derecho)

                                data.doc.line(x, y, x, y + h); // left
                                data.doc.line(x, y + h, x + w, y + h); // bottom
                            } else if (data.column.index === 3) {
                                // Dibuja todos los bordes normalmente
                                data.doc.line(x, y + h, x + w, y + h); // bottom
                            }
                        }
            } }
            );
                
                
                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY,
                    theme: 'plain',
                    margin: { left: margenHoja, right: margenHoja },
                    body: [
                        [
                            { content: 'Dirección de la empresa (donde labora):', styles: { fontStyle: 'bold' }, colSpan: 4 },

                        ],
                        [
                           { colSpan: 4, content: rutogramaData.DireccionEmpresa }
                        ]
                        
                    ],
                    styles: { font: 'NotoSans', fontSize: 9 },

                });
                currentY = (doc as any).lastAutoTable.finalY+2 ;
                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                autoTable(doc, {
                    startY: (doc as any).lastAutoTable.finalY +10,

                    theme: 'plain',
                    margin: { left: margenHoja, right: margenHoja
                        },
                    body: [
                        [

                            { content: 'Dirección de habitación principal:', styles: { fontStyle: 'bold' }, colSpan: 4 }
                        ],
                        [
                            { colSpan: 4, content: rutogramaData.DireccionHabitacion }
                        ]],
                    styles: { font: 'NotoSans', fontSize: 9 },
                });
                currentY = (doc as any).lastAutoTable.finalY ;
                
            autoTable(doc, {
                startY: currentY + 5,
                theme: 'plain', // Cambia a 'grid' para mostrar bordes en todas las celdas
                margin: { left: margenHoja, right: margenHoja },
                body: [
                    [
                        { content: 'Horario de trabajo:', styles: { fontStyle: 'bold' } },
                        rutogramaData.Horario,
                        { content: 'Nro. Contacto Emergencia:', styles: { fontStyle: 'bold' } },
                        rutogramaData.ContactoEmergencia
                    ],
                ],
                styles: { font: 'NotoSans', fontSize: 9, textColor: [0, 0, 0] },
                columnStyles: {
                    0: { cellWidth: (pageWidth - margenHoja * 2) / 5 },
                    1: { cellWidth: (pageWidth - margenHoja * 2) / 5, overflow: 'linebreak' },
                    2: { cellWidth: (pageWidth - margenHoja * 2) / 3 },
                    3: { cellWidth: (pageWidth - margenHoja * 2) / 3.75, overflow: 'linebreak' },
                },
                bodyStyles: {},
                useCss: true,
                didDrawCell: function (data) {
                    // Encierra la celda 0 y 1 con un borde externo, pero omite la línea derecha de la celda 0
                    if (data.row.index === 0 && (data.column.index === 0 || data.column.index === 1)) {
                        const { cell } = data;
                        const x = cell.x;
                        const y = cell.y;
                        const w = cell.width;
                        const h = cell.height;
                        data.doc.setDrawColor(0, 0, 0);
                        if (data.column.index === 0) {
                            // Solo dibuja el borde izquierdo, superior e inferior (omite el derecho)
                            data.doc.line(x, y, x + w, y); // top
                            data.doc.line(x, y, x, y + h); // left
                            data.doc.line(x, y + h, x + w, y + h); // bottom
                        } else if (data.column.index === 1) {
                            // Dibuja todos los bordes normalmente
                            data.doc.line(x, y, x + w, y); // top
                            data.doc.line(x + w, y, x + w, y + h); // right
                            data.doc.line(x, y + h, x + w, y + h); // bottom
                        }
                        
                    }
                    if (data.row.index === 0 && (data.column.index === 2 || data.column.index === 3)) {
                        const { cell } = data;
                        const x = cell.x;
                        const y = cell.y;
                        const w = cell.width;
                        const h = cell.height;
                        data.doc.setDrawColor(0, 0, 0);
                        if (data.column.index === 2) {
                            // Solo dibuja el borde izquierdo, superior e inferior (omite el derecho)
                            data.doc.line(x, y, x + w, y); // top
                            data.doc.line(x, y, x, y + h); // left
                            data.doc.line(x, y + h, x + w, y + h); // bottom
                        } else if (data.column.index === 3) {
                            // Dibuja todos los bordes normalmente
                            data.doc.line(x, y, x + w, y); // top
                            data.doc.line(x + w, y, x + w, y + h); // right
                            data.doc.line(x, y + h, x + w, y + h); // bottom
                        }
                        
                    }
                },
            });
                currentY = (doc as any).lastAutoTable.finalY + 10;
                drawSectionTitle("Ruta habitual desde su domicilio hasta el centro de trabajo");
                
                // Renderizar los checkboxes en una línea y guardar el HTML en un canvas temporal
                // Pero para el autotable, generamos una celda con los checkboxes como texto
                // Usamos un string con los vehículos marcados
                const vehiculosCheckboxesIda = tiposTransporte.map(v => {
                    const seleccionado = rutogramaData.VehiculoIda.find(vehiculoSeleccionado => vehiculoSeleccionado.id_tipo_vehiculo === v.IdTipo);
                    let valor = "___";
                    if (seleccionado) {
                        if (v.IdTipo === 8 && seleccionado.otro_tipo_vehiculo) {
                            valor = "̲ ̲X̲_" +seleccionado.otro_tipo_vehiculo;
                        } else {
                            valor = "̲ ̲X̲_"; // Subrayar la X
                        }
                    }
                    // Subrayar la X o el texto si está seleccionado, subrayar ___ si no
                    let resultado = `${v.nombre} ${seleccionado ? `\u0332${valor}` : "___"}`;
                    if (v.IdTipo === 8 && seleccionado?.otro_tipo_vehiculo) {
                        resultado = `\n${resultado}`; // Salto de línea antes de "Otro"
                    }
                    return resultado;
                }).join('   ');

                const actividadNombre = (id: number) => {
                    const actividad = tiposActividad.find(act => act.id === id);
                    return actividad ? actividad.nombre : 'Desconocida';
                }

                
                // Función para generar la "X" sobre una línea o una línea vacía
                const getMarcador = (checked: boolean) => checked ? '\u0332X\u0332' : '___';

                // Para la hora (p.m. / a.m.)
                const horaSalidaTextIda = `p. m. ${getMarcador(!rutogramaData.EsAmIda)} a. m. ${getMarcador(rutogramaData.EsAmIda)}`;
                // Para el tiempo de viaje
                const tiempoViajeMap: Record<string, string> = {
                    "0-30": "De 0 a 30 min",
                    "30-60": "De 30 a 60 min",
                    "60-90": "De 60 a 90 min",
                    "90-120": "De 90 a 120 min"
                };
                const tiempoViajeOptions = Object.values(tiempoViajeMap);
                // Busca el valor en tiempoViajeMap, si no existe, usa el valor original
                const tiempoViajeSeleccionadoIda = tiempoViajeMap[rutogramaData.TiempoViajeIda] || rutogramaData.TiempoViajeIda;
                const tiempoViajeTextIda = tiempoViajeOptions
                    .map((option, idx) => {
                        const marcador = `${option} ${getMarcador(tiempoViajeSeleccionadoIda === option)}`;
                        return idx % 2 === 0 ? `\n${marcador}` : marcador;
                    })
                    .join('  ');

                // Para las escalas (Sí / No)
                const escalasTextIda = `Si ${getMarcador(rutogramaData.HaceEscalasIda)} No ${getMarcador(!rutogramaData.HaceEscalasIda)}`;

                // Para el número de transferencias


                const transferenciasOptions = [0, 1, 2, 3];
                const transferenciasTextIda = `\n `+ transferenciasOptions
                    .map(option => `${option} ${getMarcador(rutogramaData.NumeroTransferenciasIda === option)}`)
                    .join('   ');

                autoTable(doc,
                    { 
                    startY: currentY, // Asegúrate de que esta variable tenga la posición Y correcta
                    theme: 'grid', // Usa 'grid' para que se muestren todos los bordes
                    margin: { left: margenHoja, right: margenHoja },
                    body: [
                        // Fila 1: Título del tipo de vehículo, ocupa las 2 columnas
                        [
                            { 
                                content: `Tipo de Vehículo: ${vehiculosCheckboxesIda}`, colSpan: 4, 
                                styles: { fontStyle: 'bold' } 
                            },
                        ],
                        // Fila 2: Hora de salida y Tiempo de viaje
                        [
                            { content: `Hora de salida: ${rutogramaData.HoraSalida} ${horaSalidaTextIda}` },
                            { content: `Tiempo de viaje: ${tiempoViajeTextIda}` },
                            { content: `Hace escalas: ${escalasTextIda}` },
                            { content: `Nro. de transferencias: ${transferenciasTextIda}` }
                        ]
                    ],
                    // Estilos para que se vea compacto y legible como en la imagen
                    styles: { 
                        font: 'NotoSans', 
                        fontSize: 8, 
                        valign: 'middle' ,
                        textColor: [0, 0, 0]
                    },
                    columnStyles: {
                        0: { cellWidth: (pageWidth - margenHoja * 2+60) / 4 },
                        1: { cellWidth: (pageWidth - margenHoja * 2+100) / 4 },
                        2: { cellWidth: (pageWidth - margenHoja * 2-120) / 4 },
                        3: { cellWidth: (pageWidth - margenHoja * 2-40) / 4 }
                    },
                    bodyStyles: { 
                        lineColor: [0, 0, 0]
                    },
                });


                // Actualiza la posición Y para el siguiente elemento del PDF
                currentY = (doc as any).lastAutoTable.finalY;
                
                autoTable(doc, {
                    startY: currentY,
                    theme: 'plain',
                    margin: { left: margenHoja, right: margenHoja },
                    body: [
                        [
                            { content: 'Describa el traslado:', styles: { fontStyle: 'bold' },  }
                        ],
                        [
                            { content: rutogramaData.DescripcionRutaIda,
                            styles: { valign: 'top', halign: 'left' , minCellHeight: 90} }
                        ]
                    ],
                    styles: { font: 'NotoSans', fontSize: 9 },
                });
                currentY = (doc as any).lastAutoTable.finalY +10;
                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                autoTable(doc, { // <-- 3. Usar la función autoTable()
                    startY: currentY,
                    theme: 'plain',
                        margin: { left: margenHoja, right: margenHoja },
                   /*  head:[
                        {content:''}
                    ], */
                    body: [
                        [
                            { content: 'Posible ruta alterna:', styles: { fontStyle: 'bold' }, colSpan: 2 }
                        ],
                        [
                            { content: rutogramaData.RutaAlternaIda , colSpan: 2, styles: { valign: 'top', halign: 'left' , minCellHeight: 90} }
                        ]
                    ],            
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                
               drawSectionTitle("Indique si realiza alguna actividad antes de llegar al centro de trabajo");
               
              
              // doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight);

                    // 1. Obtener los tipos seleccionados (pueden repetirse, así que usamos Set)
                    const tiposSeleccionadosIda = Array.from(
                        new Set(rutogramaData.ActividadesIda?.map(act => act.TipoActividad))
                    );

                    // 2. Renderizar la lista de actividades con X en los seleccionados
                    const listaActividadesIda = tiposActividad.map(act => {
                        let nombre = act.nombre.replace(/\s+/g, '');
                        if (nombre.toLowerCase().includes("otro")) {
                            
                            // Si es "Otro", busca la descripción de la actividad correspondiente
                            const actividadOtro = rutogramaData.ActividadesIda?.find(a => a.TipoActividad === act.id);
                            return `${nombre} ${tiposSeleccionadosIda.includes(act.id) ? "̲ ̲X̲_" : '__'} Indique: ${actividadOtro?.otroTipoActividad || ''}`;
                        }
                        return `${nombre} ${tiposSeleccionadosIda.includes(act.id) ? "̲ ̲X̲_" : '__'}`;
                    }).join(' ');

                        // 3. Mostrar la celda con todos los tipos de actividad
                    autoTable(doc, {
                        startY: currentY,
                        theme: 'grid',
                        margin: { left: margenHoja, right: margenHoja },
                        body: [
                            [
                                { content: `Tipo de actividad: ${listaActividadesIda}`, colSpan: 4 }
                            ]
                        ],
                        styles: { font: 'NotoSans', fontSize: 9 },
                        columnStyles: { // Apply border to the entire cell
                            0: { lineColor: [0, 0, 0], lineWidth: 0.5 }
                        }
                    });
                    currentY = (doc as any).lastAutoTable.finalY + 10;

                if (rutogramaData.HaceActividadAntesIda && rutogramaData.ActividadesIda?.length) {
                    
                    if(currentY > pageHeight - 50) {
                    doc.addPage();
                    currentY = margin;
                    printHeader(); 
                    doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco
                }
                else{
                    doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight);
                }
                     
                     rutogramaData.ActividadesIda.forEach((act: ActividadPDF,idx ) => {
                         // Si no es la primera actividad, crea una nueva página y repite el encabezado
                         
                        if ( currentY > pageHeight) {
                            doc.addPage();
                            currentY = margin;
                            printHeader();
                            drawSectionTitle("Indique si realiza alguna actividad antes de llegar al centro de trabajo");
                            doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco
                        }
                           
                        autoTable(doc, {
                            startY: currentY,
                            margin: { left: margenHoja, right: margenHoja },
                            theme: 'plain',
                            head: [[{content: `Actividad: ${actividadNombre(act.TipoActividad)}`, colSpan: 4, styles: {halign: 'center', fontStyle: 'bold'} }]],
                            body: [
                                [{content: 'Descripción de la Actividad:', styles: {fontStyle: 'bold'}, colSpan: 4} ],
                                [{content: act.Descripcion, colSpan:4}],

                                [{content: 'Ubicación:', styles: {fontStyle: 'bold'}}, {content: act.Ubicacion, colSpan: 4}],
                                [{content: 'Tiempo aprox.:', styles: {fontStyle: 'bold'}}, act.TiempoAproximado, {content: 'Frecuencia:', styles: {fontStyle: 'bold'}}, act.Frecuencia],
                            ],
                            styles: { font: 'NotoSans', fontSize: 9 , lineColor: [0,0,0]
                            },
                            
                            headStyles: { fillColor: [230,230,230], textColor: [0,0,0], 
                                lineColor: [0,0,0], lineWidth: 0.5

                            }, // gris claro
                            didDrawCell: function (data) {

                                // Encierra la celda 0 y 1 con un borde externo, pero omite la linea de abajo
                                if (data.row.index === 0 ) {
                                    const { cell } = data;
                                    const x = cell.x;
                                    const y = cell.y;
                                    const w = cell.width;
                                    const h = cell.height;
                                    data.doc.setDrawColor(0, 0, 0);
                                    if (data.column.index === 0) {
                                        //solo evita dibujar la línea de abajo
                                        data.doc.line(x, y, x + w, y); 
                                        data.doc.line(x, y, x, y + h); // left
                                        data.doc.line(x + w, y, x + w, y + h); // right
                                        //data.doc.line(x, y + h, x + w, y + h); // bottom
                                    }
                                }
                                if (data.row.index === 1 || data.row.index === 2 || data.row.index === 3 || data.row.index === 4) {
                                    const { cell } = data;
                                    const x = cell.x;
                                    const y = cell.y;
                                    const w = cell.width;
                                    const h = cell.height;
                                    data.doc.setDrawColor(0, 0, 0);
                                    // Solo dibuja la línea de abajo de la celda
                                    data.doc.line(x, y + h, x + w, y + h); // bottom
                                    data.doc.line(x, y, x, y + h); // left
                                    data.doc.line(x + w, y, x + w, y + h); // right
                                }
                            }
                        });

                        currentY = (doc as any).lastAutoTable.finalY + 15;
                    });
                    // Después de mostrar todas las actividades, crea una nueva página para la siguiente sección
                    doc.addPage();
                    currentY = margin;
                    printHeader();
                    doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco
                }
                if(!rutogramaData.HaceActividadAntesIda){
                    
                doc.addPage();
                currentY = margin;
                printHeader(); 
                doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco
                }
                
                drawSectionTitle("Ruta habitual desde el centro de trabajo hasta su domicilio");
                
                const vehiculosCheckboxesRegreso = tiposTransporte.map(v => {
                    const seleccionado = rutogramaData.VehiculoRegreso.find(vehiculoSeleccionado => vehiculoSeleccionado.id_tipo_vehiculo === v.IdTipo);
                    let valor = "___";
                    if (seleccionado) {
                        if (v.IdTipo === 8 && seleccionado.otro_tipo_vehiculo) {
                            valor = seleccionado.otro_tipo_vehiculo;
                        } else {
                            valor = "X";
                        }
                    }
                    // Subrayar la X o el texto si está seleccionado, subrayar ___ si no
                    return `${v.nombre} ${seleccionado ? `\u0332${valor}` : "___"}`;
                }).join('   ');
               



                // --- Prepara los textos para la tabla de Ruta de Regreso ---

                // Para la hora (p.m. / a.m.)
                const horaSalidaTextRegreso = `p. m. ${getMarcador(!rutogramaData.EsAmRegreso)} a. m. ${getMarcador(rutogramaData.EsAmRegreso)}`;
                const tiempoViajeSeleccionadoRegreso = tiempoViajeMap[rutogramaData.TiempoViajeRegreso] || rutogramaData.TiempoViajeRegreso;

                const tiempoViajeTextRegreso = `\n`+ tiempoViajeOptions
                    .map((option, idx) => {
                        const marcador = `${option} ${getMarcador(tiempoViajeSeleccionadoRegreso === option)}`;
                        return idx % 2 === 0 ? `\n${marcador}` : marcador;
                    })
                    .join(' ');

                // Para las escalas (Sí / No)
                const escalasTextRegreso = `Si ${getMarcador(rutogramaData.HaceEscalasRegreso)} No ${getMarcador(!rutogramaData.HaceEscalasRegreso)}`;

                // Para el número de transferencias

                const transferenciasTextRegreso = '\n  '+ transferenciasOptions
                    .map(option => `${option} ${getMarcador(rutogramaData.NumeroTransferenciasRegreso === option)}`)
                    .join('  ');
                    
                autoTable(doc, {
                    startY: currentY,
                    theme: 'grid',
                    margin: { left: margenHoja, right: margenHoja },
                    body: [
                        [
                            { content: `Tipo de Vehículo: ${vehiculosCheckboxesRegreso}`, colSpan: 4, styles: { fontStyle: 'bold' } }
                        ],
                        [
                            { content: `Hora de salida: ${rutogramaData.HoraRegreso} ${horaSalidaTextRegreso}` },
                            { content: `Tiempo de viaje: ${tiempoViajeTextRegreso}` },
                            { content: `Hace escalas: ${escalasTextRegreso}` },
                            { content: `Nro. de transferencias: ${transferenciasTextRegreso}` }
                        ]
                    ],
                    styles: {
                        font: 'NotoSans',
                        fontSize: 8,
                        valign: 'middle',
                        textColor: [0, 0, 0]
                    },
                    columnStyles: {
                        0: { cellWidth: (pageWidth - margenHoja * 2) / 4 },
                        1: { cellWidth: (pageWidth - margenHoja * 2+80) / 4 },
                        2: { cellWidth: (pageWidth - margenHoja * 2-80) / 4 },
                        3: { cellWidth: (pageWidth - margenHoja * 2) / 4 }
                    },
                    bodyStyles: {
                        lineColor: [0, 0, 0]
                    },
                });



                // Actualiza la posición Y para el siguiente elemento del PDF

                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                currentY = (doc as any).lastAutoTable.finalY;
                autoTable(doc, {
                    startY: currentY,
                    theme: 'plain',
                    margin: { left: margenHoja, right: margenHoja },
                    body: [
                        [
                            { content: 'Describa el traslado:', styles: { fontStyle: 'bold' },  }
                        ],
                        [
                            { content: rutogramaData.DescripcionRutaRegreso,
                            styles: { valign: 'top', halign: 'left' , minCellHeight: 90} }
                        ]
                    ],
                    styles: { font: 'NotoSans', fontSize: 9 },
                });
                currentY = (doc as any).lastAutoTable.finalY +10;
                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                autoTable(doc, { // <-- 3. Usar la función autoTable()
                    startY: currentY,
                    theme: 'plain',
                        margin: { left: margenHoja, right: margenHoja },
                   /*  head:[
                        {content:''}
                    ], */
                    body: [
                        [
                            { content: 'Posible ruta alterna:', styles: { fontStyle: 'bold' }, colSpan: 2 }
                        ],
                        [
                            { content: rutogramaData.RutaAlternaRegreso , colSpan: 2, styles: { valign: 'top', halign: 'left' , minCellHeight: 90} }
                        ]
                    ],            
                });
                currentY = (doc as any).lastAutoTable.finalY + 15;
                doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);


                drawSectionTitle("Actividad al salir del centro de trabajo");
                    // Solo dibuja el rect si hay suficiente espacio, si no, crea nueva página y dibuja allí
                    const rectHeight = pageHeight - currentY > 80 ? pageHeight - currentY : 80;
                    if (currentY + rectHeight > pageHeight) {
                        doc.addPage();
                        currentY = margin;
                        printHeader();
                        doc.setFont('NotoSans', 'normal');
                        doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight); // Fondo blanco
                    }
                   

                    // 1. Obtener los tipos seleccionados (pueden repetirse, así que usamos Set)
                    const tiposSeleccionados = Array.from(
                        new Set(rutogramaData.ActividadesRegreso?.map(act => act.TipoActividad))
                    );

                    // 2. Renderizar la lista de actividades con X en los seleccionados
                    const listaActividades = tiposActividad.map(act => {
                        let nombre = act.nombre.replace(/\s+/g, '');
                        if (nombre.toLowerCase().includes("otro")) {
                            // Si es "Otro", busca la descripción de la actividad correspondiente
                            const actividadOtro = rutogramaData.ActividadesRegreso?.find(a => a.TipoActividad === act.id);
                            return `${nombre} ${tiposSeleccionados.includes(act.id) ? "̲ ̲X̲_" : '__'} Indique: ${actividadOtro?.otroTipoActividad || ''}`;
                        }
                        return `${nombre} ${tiposSeleccionados.includes(act.id) ? "̲ ̲X̲_" : '__'}`;
                    }).join('   ');

                        // 3. Mostrar la celda con todos los tipos de actividad
                    autoTable(doc, {
                        startY: currentY,
                        theme: 'plain',
                        margin: { left: margenHoja, right: margenHoja },
                        body: [
                            [
                                { content: `Tipo de actividad: ${listaActividades}`, colSpan: 4 }
                            ]
                        ],
                        styles: { font: 'NotoSans', fontSize: 9 },
                    });
                    
                    currentY = (doc as any).lastAutoTable.finalY + 10;
                    doc.line(margenHoja,currentY,pageWidth - margenHoja,currentY);
                // Si el usuario indicó que realiza actividades al salir del centro de trabajo y hay actividades registradas
                if (rutogramaData.HaceActividadAntesRegreso && rutogramaData.ActividadesRegreso?.length) {
                    

                    rutogramaData.ActividadesRegreso.forEach((act: ActividadPDF,idx) => {
                        // Primera tabla de la actividad
                        autoTable(doc, {
                            startY: currentY,
                            theme: 'grid',
                            margin: { left: margenHoja, right: margenHoja },
                            head: [[{content: `Actividad: ${actividadNombre(act.TipoActividad)}`, colSpan: 4, styles: {halign: 'center', fontStyle: 'bold',lineColor: [0,0,0]} }]],
                            body: [  
                                [{content: 'Descripción de la Actividad:', styles: {fontStyle: 'bold'}}, {content: act.Descripcion, colSpan:3}],
                                [{content: 'Ubicación:', styles: {fontStyle: 'bold'}}, {content: act.Ubicacion, colSpan:3}],
                                [{content: 'Tiempo aprox.:', styles: {fontStyle: 'bold'}}, act.TiempoAproximado, {content: 'Frecuencia:', styles: {fontStyle: 'bold'}}, act.Frecuencia],
                            ],
                            styles: { font: 'NotoSans', fontSize: 9 , lineColor: [0,0,0] },
                            headStyles: { fillColor: [230,230,230], textColor: [0,0,0] },
                           /*  didDrawCell: function (data) {
                                if (data.cell.section === 'body') {

                            } */
                        });
                        currentY = (doc as any).lastAutoTable.finalY + 15;

                        // Si la siguiente tabla sobrepasa el límite de la página, crea una nueva hoja
                        if (currentY > pageHeight - 50) {
                            doc.addPage();
                            currentY = margin;
                            printHeader();
                            // Verifica si quedan más actividades por renderizar
                            // Si es la última actividad, no repite el título
                            if (idx < (rutogramaData.ActividadesRegreso?.length ?? 0) - 1) {
                                drawSectionTitle("Actividad al salir del centro de trabajo");
                            }
                            doc.setFontSize(12);
                            doc.setFont('NotoSans', 'normal');
                            doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight);
                        }
        
                    });
                }
                 /* doc.rect(margenHoja, currentY, pageWidth - margenHoja * 2, pageHeight);  */// Fondo blanco
                currentY += 20;
               
                const finalText = "Bajo FE de juramento declaro que los datos que he suministrado en este formulario son ciertos y si cambiare de domicilio me comprometo a notificar por escrito a la empresa en un lapso de dos (2) días hábiles, eximiendo a la misma de responsabilidad alguna en caso de incumplimiento de la notificación.";
                const finalLines = doc.splitTextToSize(finalText, contentWidth);
                doc.text(finalLines, margin, currentY);
                currentY += (finalLines.length * 10) + 40;

                doc.text("_________________________", margin + 35, currentY);
                doc.text("_________________________", pageWidth / 2 -30, currentY, { align: 'left' });
                doc.text("_________________________", margin + 35, currentY+40);
                doc.text("_________________________", pageWidth / 2 -30, currentY+40, { align: 'left' });
                doc.text("_____________________________", pageWidth - margin - 25, currentY+80, { align: 'right' });
                doc.text("Lugar: ", margin, currentY);
                doc.text("Fecha:", pageWidth / 2 -70, currentY);
                doc.text("Firma: ", margin, currentY+40);
                doc.text("Cédula:", pageWidth / 2 -70, currentY+40);
                doc.text("Huella pulgar derecho", pageWidth - margin - 35, currentY+95, { align: 'right' });

                // En lugar de guardar, genera un Blob y crea una URL
                const pdfBlob = doc.output('blob');
                const url = URL.createObjectURL(pdfBlob);
                setPdfUrl(url);

            } catch (error) {
                console.error("Error al generar el PDF:", error);
                alert("Ocurrió un error al generar el reporte.");
            } finally {
                setLoading(false);
            }
        };

        generatePDF();

        // Limpieza al desmontar el componente
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [rutogramaData]);

    const handleDownload = () => {
        if (pdfUrl && rutogramaData) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = `Rutograma_${rutogramaData.Cedula}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
        const handleOpenInNewTab = () => {
        if (pdfUrl) {
            window.open(pdfUrl, '_blank');
        }
    };


    if (loading) {
        return <div style={{ textAlign: 'center', padding: '50px' }}>Generando vista previa del PDF...</div>;
    }

    if (!pdfUrl) {
        return <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>No se pudo generar el reporte. Verifique los datos.</div>;
    }

    return (
        <div style={{ height: '90%', width: '100%' }}>
            <div
                style={{
                    alignItems: 'center',
                    backgroundColor: '#eeeeee',
                    borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '4px',
/*                     position: 'fixed',
                    top: '15vh',
                    width: '83.35vw',
                    zIndex: 1, */
                    gap: '12px',
                }}
            >
                <Button onClick={handleDownload} variant="primary" className="ms-2">Descargar PDF</Button>
                <Button onClick={handleOpenInNewTab} variant="secondary" className="ms-2">Abrir en pestaña nueva</Button>
                <ZoomOutButton />
                <ZoomPopover />
                <ZoomInButton />
            </div>
            <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
                <Viewer
                    fileUrl={pdfUrl}
                    plugins={[zoomPluginInstance]}
                />
            </Worker>
        </div>
    );
};

export default ReporteRutograma;