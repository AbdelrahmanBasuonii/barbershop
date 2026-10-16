import { useEffect, useState } from 'react';
import { api, daysOfWeek } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function VisitPage() {
  const { t, isEnglish } = useLocale();
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('public').then(data => setSettings(data.settings)).catch(problem => setError(problem.message));
  }, []);
  return (
    <section className="content-section">
      <PageTitle eyebrow={t('زورنا في المحل')} description={t('مستنيينك في أي وقت خلال مواعيد العمل.')}>{t('العنوان والمواعيد')}</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      {settings && <div className="visit-grid">
        <article className="visit-card panel"><span className="eyebrow">{t('العنوان')}</span><h2>{t(settings.name)}</h2><p>{t(settings.address)}</p>
          <a href={`tel:${settings.phone}`} className="phone-link">☎ {settings.phone}</a>
          {settings.mapUrl && <iframe className="map-frame" src={settings.mapUrl} title={t('خريطة موقع محل الحلاقة')} loading="lazy" />}
        </article>
        <article className="visit-card hours-card"><span className="eyebrow">{t('مواعيدنا')}</span><h2>{t('كل يوم بنستناك')}</h2><p>{t('من')} {settings.openTime} {t('إلى')} {settings.closeTime}</p>
          <p className="muted">{t('الإجازة:')} {settings.offDays.map(day => t(daysOfWeek[day])).join(isEnglish ? ', ' : '، ') || t('لا يوجد')}</p>
        </article>
      </div>}
    </section>
  );
}
