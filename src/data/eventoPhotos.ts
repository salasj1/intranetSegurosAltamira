const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const API_URL = import.meta.env.VITE_API_URL;

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveImage {
  id: string;
  thumbnailLink?: string;
  mimeType: string;
  webViewLink?: string;
  durationMs?: number;
}

export interface PaginatedResponse {
  files: DriveImage[];
  nextPageToken?: string;
}

// List de carpetas → pasa por el backend (cacheado 10 min)
export const fetchEventFolders = async (parentFolderId: string): Promise<DriveFolder[]> => {
  try {
    const res = await fetch(`${API_URL}/galeria/carpetas/${parentFolderId}`);
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching event folders:', error);
    return [];
  }
};

// List de fotos/videos → pasa por el backend (cacheado 5 min por página)
export const fetchEventPhotos = async (
  folderId: string,
  pageToken?: string,
  pageSize: number = 30
): Promise<PaginatedResponse> => {
  let url = `${API_URL}/galeria/fotos/${folderId}?pageSize=${pageSize}`;
  if (pageToken) url += `&pageToken=${encodeURIComponent(pageToken)}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      files: (data.files || []).map((f: any) => ({
        id: f.id,
        thumbnailLink: f.thumbnailLink,
        mimeType: f.mimeType,
        webViewLink: f.webViewLink,
        durationMs: f.videoMediaMetadata?.durationMillis
          ? Number(f.videoMediaMetadata.durationMillis)
          : undefined,
      })),
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching event photos:', error);
    return { files: [] };
  }
};

export const getOptimizedUrl = (thumbnailLink: string | undefined, size: number = 600): string => {
  if (!thumbnailLink) return '';
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
};

// Streaming de video → sigue directo a Google (no se puede cachear)
export const getDriveVideoUrl = (id: string): string =>
  `https://www.googleapis.com/drive/v3/files/${id}?alt=media&key=${API_KEY}&supportsAllDrives=true`;

// Thumbnail universal: funciona para fotos Y videos sin necesitar thumbnailLink
export const getDriveThumbnailUrl = (id: string, size = 400): string =>
  `https://drive.google.com/thumbnail?id=${id}&sz=w${size}`;
