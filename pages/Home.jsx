import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import GalleryGrid from '../components/GalleryGrid.jsx';
import PageTitle from '../components/PageTitle.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import VideoGrid from '../components/VideoGrid.jsx';
import { withFeaturedGallery } from '../galleryData.js';
import { useLocale } from '../context/LocaleContext.jsx';

export default function Home() {
  const { t, isEnglish } = useLocale();
  const [content, setContent] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('public').then(setContent).catch(problem => setError(problem.message));
  }, []);

  return (
    <>
      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">{t('محلك في أيد أمينة')}</span>
          <h1>{t('قصّة تفرق،')}<br /><span>{t('وميعاد مظبوط.')}</span></h1>
          <p>{t('اختار الخدمة اللي تناسبك واحجز ميعادك في دقيقة، من غير زحمة ولا انتظار.')}</p>
          <Link className="button button-large" to="/booking">{t('احجز ميعادك')} <span aria-hidden="true">{isEnglish ? '→' : '←'}</span></Link>
        </div>
        <div className="hero-art" aria-hidden="true"><div className="hero-art-inner">✂</div><span className="hero-stamp">{t('من أول')}<br />{t('مقصّة')}</span></div>
      </section>
      <section className="content-section">
        <PageTitle eyebrow={t('خدماتنا')} description={t('اختار الخدمة المناسبة، وهتلاقي كل التفاصيل قبل تأكيد الحجز.')}>{t('خدمات على مزاجك')}</PageTitle>
        <StatusMessage error>{error}</StatusMessage>
        <div className="service-grid">
          {content?.services.map(service => <ServiceCard key={service.id} service={service} />)}
        </div>
      </section>
      <section className="content-section section-muted">
        <div className="section-inner">
          <SectionHeading title={t('من معرض الستايلات')} to="/gallery">{t('كل الصور')}</SectionHeading>
          <GalleryGrid items={withFeaturedGallery(content?.gallery || []).slice(0, 3)} />
        </div>
      </section>
      <section className="content-section">
        <SectionHeading title={t('أحدث الفيديوهات')} to="/videos">{t('كل الفيديوهات')}</SectionHeading>
        <VideoGrid items={content?.videos.slice(0, 2) || []} />
      </section>
      <section className="visit-callout">
        <div><span className="eyebrow">{t('مستنيينك')}</span><h2>{t('تعالى نضبطلك قصة تليق بيك.')}</h2></div>
        <Link className="button button-light" to="/visit">{t('العنوان والمواعيد')}</Link>
      </section>
    </>
  );
}
