// src/data/navidadPhotos.ts

const FOLDER_ID = import.meta.env.VITE_FILE_ID;
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export interface DriveImage {
  id: string;
  thumbnailLink: string;
  mimeType: string;
  webViewLink?: string;
}

// Nueva interfaz para la respuesta paginada
export interface PaginatedResponse {
  files: DriveImage[];
  nextPageToken?: string;
}

export const fetchNavidadPhotos = async (pageToken?: string, pageSize: number = 30): Promise<PaginatedResponse> => {
  // Pedimos id y thumbnailLink explícitamente
  const query = `'${FOLDER_ID}'+in+parents+and+(mimeType+contains+'image/'+or+mimeType+contains+'video/')`;
  
  // Agregamos mimeType y webViewLink a los campos solicitados
  const fields = 'nextPageToken, files(id,thumbnailLink,mimeType,webViewLink)';

  // Construimos la URL con paginación
  let url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=${fields}&pageSize=${pageSize}`;
  
  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken
    };
  } catch (error) {
    console.error("Error fetching photos:", error);
    return { files: [] };
  }
};

// Función para manipular el tamaño de la imagen usando el enlace de Google
export const getOptimizedUrl = (thumbnailLink: string, size: number = 600) => {
  // Los links suelen terminar en "=s220", lo reemplazamos por el tamaño deseado
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
};