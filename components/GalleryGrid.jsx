import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../api.js';

export default function GalleryGrid({ items = [] }) {
  const [activeImage, setActiveImage] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeImage && !dialog.open) dialog.showModal();
    if (!activeImage && dialog.open) dialog.close();
  }, [activeImage]);

  if (!items.length) return <div className="empty-state">المعرض قريباً.</div>;
  return (
    <>
      <div className="gallery-grid">
        {items.map(item => (
          <figure className="gallery-card" key={item.id}>
            <button
              className="gallery-image-button"
              type="button"
              onClick={() => setActiveImage(item)}
              aria-label={`تكبير الصورة${item.title ? `: ${item.title}` : ''}`}
            >
              <img loading="lazy" src={assetUrl(item.url)} alt={item.title || 'قصة شعر من المعرض'} />
              <span className="gallery-zoom-hint" aria-hidden="true">تكبير الصورة</span>
            </button>
            {item.title && <figcaption>{item.title}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog
        className="gallery-lightbox"
        ref={dialogRef}
        aria-label={activeImage?.title || 'عرض الصورة بحجم أكبر'}
        onClose={() => setActiveImage(null)}
        onKeyDown={event => {
          if (event.key === 'Escape') setActiveImage(null);
        }}
        onClick={event => {
          if (event.target === event.currentTarget) setActiveImage(null);
        }}
      >
        {activeImage && (
          <>
            <button className="gallery-lightbox-close" type="button" onClick={() => setActiveImage(null)} aria-label="إغلاق الصورة">
              <span aria-hidden="true">×</span>
            </button>
            <img className="gallery-lightbox-image" src={assetUrl(activeImage.url)} alt={activeImage.title || 'قصة شعر من المعرض'} />
            {activeImage.title && <p className="gallery-lightbox-caption">{activeImage.title}</p>}
          </>
        )}
      </dialog>
    </>
  );
}
