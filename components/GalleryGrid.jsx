import { useEffect, useRef, useState } from 'react';
import { assetUrl } from '../api.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function GalleryGrid({ items = [] }) {
  const { t } = useLocale();
  const [activeImage, setActiveImage] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (activeImage && !dialog.open) dialog.showModal();
    if (!activeImage && dialog.open) dialog.close();
  }, [activeImage]);

  if (!items.length) return <div className="empty-state">{t('المعرض قريباً.')}</div>;
  return (
    <>
      <div className="gallery-grid">
        {items.map(item => (
          <figure className="gallery-card" key={item.id}>
            <button
              className="gallery-image-button"
              type="button"
              onClick={() => setActiveImage(item)}
              aria-label={`${t('تكبير الصورة')}${item.title ? `: ${t(item.title)}` : ''}`}
            >
              <img loading="lazy" src={assetUrl(item.url)} alt={item.title ? t(item.title) : t('قصة شعر من المعرض')} />
              <span className="gallery-zoom-hint" aria-hidden="true">{t('تكبير الصورة')}</span>
            </button>
            {item.title && <figcaption>{t(item.title)}</figcaption>}
          </figure>
        ))}
      </div>
      <dialog
        className="gallery-lightbox"
        ref={dialogRef}
        aria-label={activeImage?.title ? t(activeImage.title) : t('عرض الصورة بحجم أكبر')}
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
            <button className="gallery-lightbox-close" type="button" onClick={() => setActiveImage(null)} aria-label={t('إغلاق الصورة')}>
              <span aria-hidden="true">×</span>
            </button>
            <img className="gallery-lightbox-image" src={assetUrl(activeImage.url)} alt={activeImage.title ? t(activeImage.title) : t('قصة شعر من المعرض')} />
            {activeImage.title && <p className="gallery-lightbox-caption">{t(activeImage.title)}</p>}
          </>
        )}
      </dialog>
    </>
  );
}
