import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL;

export const visualizarRutogramaPDF = async (rutogramaId: number) => {
  try {
    const response = await axios.get(`${apiUrl}/expediente/rutograma/${rutogramaId}/preview-pdf`, {
      responseType: 'blob', // Recibe el PDF como blob
    });

    // Crear una URL para el blob y abrir en nueva pestaña
    const fileURL = URL.createObjectURL(response.data);
    window.open(fileURL, '_blank');
  } catch (error) {
    console.error('Error al visualizar el PDF:', error);
    alert('No se pudo visualizar el PDF. Por favor, inténtelo de nuevo.');
  }
};