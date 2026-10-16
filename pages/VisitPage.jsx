import { useEffect, useState } from 'react';
import { api, daysOfWeek } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function VisitPage() {
  const [settings, setSettings] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('public').then(data => setSettings(data.settings)).catch(problem => setError(problem.message));
  }, []);
  return (
    <section className="content-section">
      <PageTitle eyebrow="زورنا في المحل" description="مستنيينك في أي وقت خلال مواعيد العمل.">العنوان والمواعيد</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      {settings && <div className="visit-grid">
        <article className="visit-card panel"><span className="eyebrow">العنوان</span><h2>{settings.name}</h2><p>{settings.address}</p>
          <a href={`tel:${settings.phone}`} className="phone-link">☎ {settings.phone}</a>
          {settings.mapUrl && <iframe className="map-frame" src={settings.mapUrl} title="خريطة موقع محل الحلاقة" loading="lazy" />}
        </article>
        <article className="visit-card hours-card"><span className="eyebrow">مواعيدنا</span><h2>كل يوم بنستناك</h2><p>من {settings.openTime} إلى {settings.closeTime}</p>
          <p className="muted">الإجازة: {settings.offDays.map(day => daysOfWeek[day]).join('، ') || 'لا يوجد'}</p>
        </article>
      </div>}
    </section>
  );
}
