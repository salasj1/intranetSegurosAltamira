import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Modal } from 'react-bootstrap';
import { Mosaic } from 'react-loading-indicators';
import loadingStyles from '@/css/loading.module.css';
import {
  fetchEventFolders,
  fetchEventPhotos,
  getOptimizedUrl,
  DriveFolder,
  DriveImage,
} from '@/data/eventoPhotos';
import styles from '../styles/EventoGalleryModal.module.css';
import { FaPlay, FaFolder } from 'react-icons/fa';
import { IoArrowBack, IoArrowForward } from 'react-icons/io5';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  parentFolderId: string;
  eventTitle: string;
}

const EventoGalleryModal: React.FC<Props> = ({ isOpen, onClose, parentFolderId, eventTitle }) => {
  const [view, setView] = useState<'folders' | 'photos'>('folders');
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);

  const [selectedFolder, setSelectedFolder] = useState<DriveFolder | null>(null);
  const [photos, setPhotos] = useState<DriveImage[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(false);
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined);
  const [hasMore, setHasMore] = useState(true);

  const [selectedPhoto, setSelectedPhoto] = useState<DriveImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [imageLoading, setImageLoading] = useState(false);

  // Índice de la foto actual en el array
  const currentIndex = selectedPhoto ? photos.findIndex(p => p.id === selectedPhoto.id) : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < photos.length - 1;

  // Carga carpetas al abrir el modal
  useEffect(() => {
    if (isOpen && folders.length === 0) {
      setLoadingFolders(true);
      fetchEventFolders(parentFolderId)
        .then((data) => setFolders(data))
        .finally(() => setLoadingFolders(false));
    }
  }, [isOpen, parentFolderId]);

  // Resetear a vista de carpetas al cerrar
  useEffect(() => {
    if (!isOpen) {
      setView('folders');
      setSelectedFolder(null);
      setPhotos([]);
      setNextPageToken(undefined);
      setHasMore(true);
      setSelectedPhoto(null);
      setZoomLevel(1);
    }
  }, [isOpen]);

  // Resetear zoom y activar loading al cambiar de foto
  useEffect(() => {
    setZoomLevel(1);
    if (selectedPhoto) setImageLoading(true);
    else setImageLoading(false);
  }, [selectedPhoto]);

  // Navegación con teclado (←/→) en el lightbox
  useEffect(() => {
    if (!selectedPhoto) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const idx = photos.findIndex(p => p.id === selectedPhoto.id);
      if (e.key === 'ArrowLeft' && idx > 0) setSelectedPhoto(photos[idx - 1]);
      else if (e.key === 'ArrowRight' && idx < photos.length - 1) setSelectedPhoto(photos[idx + 1]);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedPhoto, photos]);

  const handleFolderClick = async (folder: DriveFolder) => {
    setSelectedFolder(folder);
    setPhotos([]);
    setNextPageToken(undefined);
    setHasMore(true);
    setView('photos');
    setLoadingPhotos(true);
    try {
      const data = await fetchEventPhotos(folder.id, undefined, 30);
      setPhotos(data.files);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleBackToFolders = () => {
    setView('folders');
    setSelectedFolder(null);
    setPhotos([]);
    setNextPageToken(undefined);
    setHasMore(true);
  };

  const loadMorePhotos = async (token: string) => {
    if (loadingPhotos || !selectedFolder) return;
    setLoadingPhotos(true);
    try {
      const data = await fetchEventPhotos(selectedFolder.id, token, 30);
      setPhotos((prev) => [...prev, ...data.files]);
      setNextPageToken(data.nextPageToken);
      setHasMore(!!data.nextPageToken);
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 50 && !loadingPhotos && hasMore && nextPageToken) {
      loadMorePhotos(nextPageToken);
    }
  };

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'unset';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <>
      <Modal
        show={isOpen}
        onHide={onClose}
        fullscreen={true}
        dialogClassName={`${styles.bsModalDialog} ${styles.eventoGalleryModal}`}
        contentClassName={styles.modalContent}
        backdrop="static"
        keyboard={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {view === 'folders' ? (
              <>Galería</>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className={styles.backButton} onClick={handleBackToFolders}>
                  <IoArrowBack size={20} /> Volver
                </button>
                <span>
                  <FaFolder style={{ marginRight: '0.4rem', color: '#f0a500' }} />
                  {selectedFolder?.name}
                </span>
              </div>
            )}
            {view === 'folders' && (
              <div className={styles.subtitle}>
                Selecciona una carpeta para ver las fotos y videos para recordar los mejores momentos
              </div>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body onScroll={view === 'photos' ? handleScroll : undefined} style={{ overflowY: 'auto' }}>
          {/* Vista de carpetas */}
          {view === 'folders' && (
            <>
              {loadingFolders ? (
                <div style={{ textAlign: 'center', padding: 40 }} className={loadingStyles.loadingIndicator}>
                  <Mosaic color={['#003391', '#1A5FFA', '#33CCCC', '#1A3FFA']} size="small" text="" textColor="#0d1bff" />
                  <span style={{ marginLeft: 10, color: '#666' }}>Cargando carpetas...</span>
                </div>
              ) : folders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, color: '#999' }}>
                  No hay carpetas disponibles en este momento.
                </div>
              ) : (
                <div className={styles.foldersGrid}>
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className={styles.folderCard}
                      onClick={() => handleFolderClick(folder)}
                    >
                      <div className={styles.folderIcon}>
                        <FaFolder color="#f0a500" />
                      </div>
                      <div className={styles.folderName}>{folder.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Vista de fotos */}
          {view === 'photos' && (
            <>
              <div className={styles.pinterestGrid}>
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className={`${styles.pinWrapper} ${styles.pinCard}`}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={getOptimizedUrl(photo.thumbnailLink, 600)}
                      alt="Foto del evento"
                      loading="lazy"
                      className={styles.pinImage}
                      referrerPolicy="no-referrer"
                    />
                    {photo.mimeType && photo.mimeType.startsWith('video/') && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '50%',
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          fontSize: '3rem',
                          color: '#ffffff',
                          filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.6))',
                          pointerEvents: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <FaPlay />
                      </div>
                    )}
                    <div className={styles.hoverOverlay}>
                      <span>{photo.mimeType?.startsWith('video/') ? 'Ver video' : 'Ver foto'}</span>
                    </div>
                  </div>
                ))}
              </div>

              {loadingPhotos && (
                <div style={{ textAlign: 'center', padding: 20, width: '100%' }} className={loadingStyles.loadingIndicator}>
                  <Mosaic color={['#003391', '#1A5FFA', '#33CCCC', '#1A3FFA']} size="small" text="" textColor="#0d1bff" />
                  <span style={{ marginLeft: 10, color: '#666' }}>Cargando más fotos...</span>
                </div>
              )}

              {!hasMore && photos.length > 0 && (
                <div style={{ textAlign: 'center', padding: 20, color: '#999' }}>
                  Has visto todas lo que hay de esta carpeta.
                </div>
              )}
            </>
          )}
        </Modal.Body>
      </Modal>

      {/* Lightbox renderizado en document.body para evitar que el transform del card padre lo afecte */}
      {selectedPhoto && createPortal(
        <div className={styles.lightbox} onClick={() => setSelectedPhoto(null)}>
          <button className={styles.closeLightbox} onClick={() => setSelectedPhoto(null)}>
            Cerrar ✕
          </button>

          {/* Botón anterior */}
          <button
            className={`${styles.navBtn} ${styles.navBtnLeft}`}
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(photos[currentIndex - 1]); }}
            disabled={!hasPrev}
            title="Foto anterior (←)"
          >
            <IoArrowBack size={80} />
          </button>

          {/* Botón siguiente */}
          <button
            className={`${styles.navBtn} ${styles.navBtnRight}`}
            onClick={(e) => { e.stopPropagation(); setSelectedPhoto(photos[currentIndex + 1]); }}
            disabled={!hasNext}
            title="Foto siguiente (→)"
          >
            <IoArrowForward size={80} />
          </button>

          {/* Contador de fotos */}
          <div className={styles.photoCounter} onClick={(e) => e.stopPropagation()}>
            {currentIndex + 1} / {photos.length}
          </div>

          {selectedPhoto.mimeType && selectedPhoto.mimeType.startsWith('video/') ? (
            <div className={styles.fullImageContainer} onClick={(e) => e.stopPropagation()}>
              <iframe
                src={`https://drive.google.com/file/d/${selectedPhoto.id}/preview`}
                className={styles.fullImage}
                allow="autoplay; fullscreen"
                title="Video Player"
                style={{ border: 'none', width: '180vw', height: '80vh', aspectRatio: '16/9' }}
              />
            </div>
          ) : (
            <>
              <div
                className={styles.lightboxImageContainer}
                style={{
                  overflow: zoomLevel > 1 ? 'auto' : 'hidden',
                  alignItems: zoomLevel > 1 ? 'flex-start' : 'center',
                  justifyContent: zoomLevel > 1 ? 'flex-start' : 'center',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {imageLoading && (
                  <div className={loadingStyles.loadingIndicator} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                    <Mosaic color={['#ffffff']} size="medium" text="" textColor="#ffffff" />
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>Cargando imagen...</span>
                  </div>
                )}
                <img
                  src={getOptimizedUrl(selectedPhoto.thumbnailLink, 2000)}
                  alt="Foto completa"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoading(false)}
                  onError={() => setImageLoading(false)}
                  style={{
                    display: imageLoading ? 'none' : 'block',
                    width: zoomLevel === 1 ? 'auto' : `${zoomLevel * 50}vw`,
                    maxWidth: zoomLevel === 1 ? '98vw' : 'none',
                    maxHeight: zoomLevel === 1 ? '88vh' : 'none',
                    height: 'auto',
                    borderRadius: 4,
                    boxShadow: '0 0 30px rgba(0,0,0,0.5)',
                    border: '1px solid #003391',
                  }}
                />
              </div>

              {/* Controles de zoom */}
              <div className={styles.zoomControls} onClick={(e) => e.stopPropagation()}>
                <button
                  className={styles.zoomBtn}
                  onClick={() => setZoomLevel((prev) => Math.max(prev - 1, 1))}
                  disabled={zoomLevel <= 1}
                  title="Reducir zoom"
                >
                  −
                </button>
                <span className={styles.zoomLevel}>{zoomLevel * 50}%</span>
                <button
                  className={styles.zoomBtn}
                  onClick={() => setZoomLevel((prev) => Math.min(prev + 1, 3))}
                  disabled={zoomLevel >= 3}
                  title="Aumentar zoom"
                >
                  +
                </button>
              </div>
            </>
          )}
        </div>,
        document.body
      )}
    </>
  );
};

export default EventoGalleryModal;
