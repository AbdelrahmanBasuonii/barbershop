import { useCallback, useEffect, useState } from 'react';
import { api, bookingStatuses } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function MyBookingsPage() {
  const { t, isEnglish } = useLocale();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const refresh = useCallback(() => api('bookings/mine').then(data => setBookings(data.slice().reverse())).catch(problem => setError(problem.message)), []);
  useEffect(() => { refresh(); }, [refresh]);
  async function cancel(id) {
    try {
      await api(`bookings/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <section className="content-section">
      <PageTitle eyebrow={t('كل مواعيدك في مكان واحد')}>{t('حجوزاتي')}</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      {bookings.length ? <div className="booking-list">{bookings.map(booking => (
        <article className="booking-card" key={booking.id}>
          <div><span className="eyebrow">{booking.date} • {booking.time}</span><h2>{t(booking.service)}</h2><p>{booking.price} {t('جنيه')}</p></div>
          <div className="booking-card-actions"><span className={`status-pill status-${booking.status}`}>{bookingStatuses[booking.status]}</span>
            {['pending', 'confirmed'].includes(booking.status) && <button className="button button-outline" onClick={() => cancel(booking.id)}>{t('إلغاء الحجز')}</button>}
          </div>
        </article>
      ))}</div> : <div className="empty-state">{t('مفيش حجوزات لسه.')}</div>}
    </section>
  );
}
