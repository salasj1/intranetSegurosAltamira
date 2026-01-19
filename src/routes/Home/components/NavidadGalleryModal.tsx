import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button} from 'react-bootstrap';
import { Mosaic } from "react-loading-indicators";
import loadingStyles from '@/css/loading.module.css'; 
import { fetchNavidadPhotos, getOptimizedUrl, DriveImage } from '@/data/navidadPhotos';
import styles from '../styles/NavidadGalleryModal.module.css';
import { FaPlay } from "react-icons/fa";
interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const NavidadGalleryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [photos, setPhotos] = useState<DriveImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<DriveImage | null>(null);
  
  // Nuevos estados para paginación
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  // Función para cargar fotos (inicial o siguientes páginas)
  const loadPhotos = async (token?: string) => {
    if (loading) return;
    
    setLoading(true);
    try {
      const data = await fetchNavidadPhotos(token, 30); // Lote de 30
      
      setPhotos(prev => token ? [...prev, ...data.files] : data.files);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken); // Si hay token, hay más fotos
    } catch (error) {
      console.error("Error cargando fotos", error);
    } finally {
      setLoading(false);
    }
  };

  // Efecto inicial al abrir el modal
  useEffect(() => {
    if (isOpen && photos.length === 0) {
      loadPhotos();
    }
  }, [isOpen]);

  // Manejador de Scroll Infinito
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    
    // Si llegamos al final (con un margen de 50px) y no estamos cargando y hay más
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loading && hasMore) {
      loadPhotos(nextPageToken);
    }
  };

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onClose}
        fullscreen={true}
        dialogClassName={`${styles.bsModalDialog} ${styles.navidadGalleryModal}`}
        contentClassName={styles.modalContent} 
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            🎄 Galería Navideña
            <div className={styles.subtitle}>Revive la magia, las sonrisas y los mejores momentos.</div>
          </Modal.Title>
        </Modal.Header>
        
        {/* Agregamos onScroll al Modal.Body */}
        <Modal.Body onScroll={handleScroll} style={{ overflowY: 'auto' }}>
          
          <div className={styles.pinterestGrid}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className={`${styles.pinWrapper} ${styles.pinCard}`}
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                      // Usamos el link directo optimizado (tamaño 600px)
                      src={getOptimizedUrl(photo.thumbnailLink, 600)}
                      alt="Recuerdo de Navidad"
                      loading="lazy"
                      className={styles.pinImage}
                      referrerPolicy="no-referrer"
                    />
                    
                    {/* 2. Reemplazamos el emoji por el icono FaPlay estilizado */}
                    {photo.mimeType && photo.mimeType.startsWith('video/') && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontSize: '3rem',
                        color: '#ffffff', // Color blanco puro
                        // Sombra fuerte para contraste
                        filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))', 
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <FaPlay />
                      </div>
                    )}

                    <div className={styles.hoverOverlay}>
                      <span>{photo.mimeType?.startsWith('video/') ? 'Ver video 🎬' : 'Ver foto 👁️'}</span>
                    </div>
                </div>
              ))}
          </div>

          {/* Spinner al final para indicar carga de más fotos */}
          {loading && (
            <div style={{ textAlign: 'center', padding: 20, width: '100%' }} className={loadingStyles.loadingIndicator}>
            <Mosaic  color={["#003391", "#1A5FFA", "#33CCCC", "#1A3FFA"]} size="small" text="" textColor="#0d1bff" />
              <span style={{ marginLeft: 10, color: '#666' }}>Cargando más recuerdos...</span>
            </div>
          )}
          
          {!hasMore && photos.length > 0 && (
            <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
              ✨ Has llegado al final de la galería ✨
            </div>
          )}

        </Modal.Body>
      </Modal>

      {/* Lightbox para imagen completa o video */}
      {selectedPhoto && (
        <div className={styles.lightbox} onClick={() => setSelectedPhoto(null)}>
          <button className={styles.closeLightbox}>Cerrar ✕</button>
          <div className={styles.fullImageContainer} onClick={e => e.stopPropagation()}>
            
            {selectedPhoto.mimeType && selectedPhoto.mimeType.startsWith('video/') ? (
              <iframe
                src={`https://drive.google.com/file/d/${selectedPhoto.id}/preview`}
                className={styles.fullImage}
                allow="autoplay; fullscreen"
                title="Video Player"
                style={{ 
                  border: 'none', 
                  width: '100%', 
                  height: '80vh', // Asegura altura suficiente
                  aspectRatio: '16/9' 
                }}
              />
            ) : (
              <img
                // Pedimos la imagen en alta calidad (2000px) usando el mismo link
                src={getOptimizedUrl(selectedPhoto.thumbnailLink, 2000)}
                alt="Full size"
                className={styles.fullImage}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default NavidadGalleryModal;