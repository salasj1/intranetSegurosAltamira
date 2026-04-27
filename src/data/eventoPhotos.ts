const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;

export interface DriveFolder {
  id: string;
  name: string;
}

export interface DriveImage {
  id: string;
  thumbnailLink: string;
  mimeType: string;
  webViewLink?: string;
}

export interface PaginatedResponse {
  files: DriveImage[];
  nextPageToken?: string;
}

export const fetchEventFolders = async (parentFolderId: string): Promise<DriveFolder[]> => {
  const query = `'${parentFolderId}'+in+parents+and+mimeType='application/vnd.google-apps.folder'+and+trashed=false`;
  const fields = 'files(id,name)';
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=${fields}&orderBy=name`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.files || [];
  } catch (error) {
    console.error('Error fetching event folders:', error);
    return [];
  }
};

export const fetchEventPhotos = async (
  folderId: string,
  pageToken?: string,
  pageSize: number = 30
): Promise<PaginatedResponse> => {
  const query = `'${folderId}'+in+parents+and+(mimeType+contains+'image/'+or+mimeType+contains+'video/')`;
  const fields = 'nextPageToken, files(id,thumbnailLink,mimeType,webViewLink)';

  let url = `https://www.googleapis.com/drive/v3/files?q=${query}&key=${API_KEY}&fields=${fields}&pageSize=${pageSize}`;

  if (pageToken) {
    url += `&pageToken=${pageToken}`;
  }

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      files: data.files || [],
      nextPageToken: data.nextPageToken,
    };
  } catch (error) {
    console.error('Error fetching event photos:', error);
    return { files: [] };
  }
};

export const getOptimizedUrl = (thumbnailLink: string, size: number = 600) => {
  return thumbnailLink.replace(/=s\d+$/, `=s${size}`);
};
