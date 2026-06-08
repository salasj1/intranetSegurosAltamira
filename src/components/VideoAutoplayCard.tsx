import React, { useRef, useEffect, useState } from 'react';

// ── Cola de descarga (módulo-level, 1 descarga activa a la vez) ──
let activeDownloads = 0;
const MAX_CONCURRENT = 2;
const pendingQueue: Array<() => void> = [];

function processQueue() {
  while (activeDownloads < MAX_CONCURRENT && pendingQueue.length > 0) {
    const start = pendingQueue.shift()!;
    activeDownloads++;
    start();
  }
}

function signalDownloadDone() {
  activeDownloads = Math.max(0, activeDownloads - 1);
  processQueue();
}

export function resetVideoQueue() {
  pendingQueue.length = 0;
  activeDownloads = 0;
}
// ────────────────────────────────────────────────────────────────

interface Props {
  src: string;
  thumbnail?: string;
  onClick: () => void;
  videoClass?: string;
  autoplayOnVisible?: boolean;
}

const VideoAutoplayCard: React.FC<Props> = ({
  src, thumbnail, onClick, videoClass, autoplayOnVisible,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [videoVisible, setVideoVisible] = useState(false);

  // Modo autoplay: descarga en cola → play cuando listo + en viewport
  useEffect(() => {
    if (!autoplayOnVisible) return;
    const video = videoRef.current;
    const container = wrapperRef.current;
    if (!video || !container) return;

    let isMounted = true;
    let isDownloading = false;
    let isReady = false;
    let isInViewport = false;
    let observer: IntersectionObserver | null = null;

    const tryPlay = () => {
      if (isReady && isInViewport && isMounted) {
        setVideoVisible(true);
        video.play().catch(() => {});
      }
    };

    const handleCanPlayThrough = () => {
      if (!isMounted) return;
      isReady = true;
      if (isDownloading) {
        isDownloading = false;
        signalDownloadDone();
      }
      tryPlay();
    };

    const handleError = () => {
      if (isDownloading) {
        isDownloading = false;
        signalDownloadDone();
      }
    };

    video.addEventListener('canplaythrough', handleCanPlayThrough, { once: true });
    video.addEventListener('error', handleError, { once: true });

    observer = new IntersectionObserver(
      ([entry]) => {
        isInViewport = entry.isIntersecting;
        if (isInViewport) {
          tryPlay();
        } else {
          video.pause();
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(container);

    // Registrar en la cola; se ejecuta cuando le toca
    const startDownload = () => {
      if (!isMounted) {
        signalDownloadDone(); // libera el slot inmediatamente
        return;
      }
      isDownloading = true;
      video.src = src;
      video.preload = 'auto';
      video.load();
    };
    pendingQueue.push(startDownload);
    processQueue();

    return () => {
      isMounted = false;
      observer?.disconnect();
      video.removeEventListener('canplaythrough', handleCanPlayThrough);
      video.removeEventListener('error', handleError);

      const idx = pendingQueue.indexOf(startDownload);
      if (idx !== -1) pendingQueue.splice(idx, 1);

      if (isDownloading) {
        isDownloading = false;
        signalDownloadDone();
      }

      video.pause();
      video.src = '';
      video.load();
    };
  }, [autoplayOnVisible, src]);

  return (
    <div
      ref={wrapperRef}
      onClick={onClick}
      style={{ cursor: 'pointer', position: 'relative', borderRadius: '12px', overflow: 'hidden', background: '#16213e' }}
    >
      {!videoVisible && (
        <>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              referrerPolicy="no-referrer"
              style={{ width: '100%', height: 'auto', display: 'block', borderRadius: '12px' }}
            />
          ) : (
            <div
              style={{
                width: '100%',
                aspectRatio: '16/9',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="rgba(255,255,255,0.4)">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
          {thumbnail && (
            <div
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '48px', height: '48px',
                background: 'rgba(0,0,0,0.55)',
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" style={{ marginLeft: '3px' }}>
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </>
      )}

      {/* Elemento video solo existe cuando hay preload activo */}
      {autoplayOnVisible && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          preload="none"
          className={videoClass}
          style={{
            width: '100%', height: 'auto',
            display: videoVisible ? 'block' : 'none',
            borderRadius: '12px',
          }}
          onError={() => setVideoVisible(false)}
        />
      )}
    </div>
  );
};

export default VideoAutoplayCard;
