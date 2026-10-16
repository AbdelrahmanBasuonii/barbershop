export const featuredGallery = [
  { id: 'featured-1', title: 'حلاقة شعر ولحية', url: '/gallery/barber-style-01.jpeg' },
  { id: 'featured-2', title: 'تفاصيل شغلنا', url: '/gallery/barber-style-02.jpeg' },
  { id: 'featured-3', title: 'قصة شعر كلاسيكية', url: '/gallery/barber-style-03.jpeg' },
  { id: 'featured-4', title: 'تحديد تدريجي', url: '/gallery/barber-style-04.jpeg' },
  { id: 'featured-5', title: 'ستايل عصري', url: '/gallery/barber-style-05.jpeg' },
  { id: 'featured-6', title: 'عناية باللحية', url: '/gallery/barber-style-06.jpeg' },
  { id: 'featured-7', title: 'من أجواء المحل', url: '/gallery/barber-style-07.jpeg' }
];

export function withFeaturedGallery(items = []) {
  const existingUrls = new Set(items.map(item => item.url));
  return [...items, ...featuredGallery.filter(item => !existingUrls.has(item.url))];
}
