import { useEffect, useState } from 'react';
import { api } from '../api.js';
import GalleryGrid from '../components/GalleryGrid.jsx';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { featuredGallery, withFeaturedGallery } from '../galleryData.js';

export default function GalleryPage() {
  const [items, setItems] = useState(featuredGallery);
  const [error, setError] = useState('');
  useEffect(() => {
    api('public').then(data => setItems(withFeaturedGallery(data.gallery))).catch(problem => setError(problem.message));
  }, []);
  return <section className="content-section"><PageTitle eyebrow="إلهامك الجاي" description="شوف اختيارات من شغلنا قبل ما تختار قصتك.">معرض الستايلات</PageTitle><StatusMessage error>{error}</StatusMessage><GalleryGrid items={items} /></section>;
}
