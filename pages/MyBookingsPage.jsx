import { useCallback, useEffect, useState } from 'react';
import { api, bookingStatuses } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function MyBookingsPage() {
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
      <PageTitle eyebrow="كل مواعيدك في مكان واحد">حجوزاتي</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      {bookings.length ? <div className="booking-list">{bookings.map(booking => (
        <article className="booking-card" key={booking.id}>
          <div><span className="eyebrow">{booking.date} • {booking.time}</span><h2>{booking.service}</h2><p>{booking.price} جنيه</p></div>
          <div className="booking-card-actions"><span className={`status-pill status-${booking.status}`}>{bookingStatuses[booking.status]}</span>
            {['pending', 'confirmed'].includes(booking.status) && <button className="button button-outline" onClick={() => cancel(booking.id)}>إلغاء الحجز</button>}
          </div>
        </article>
      ))}</div> : <div className="empty-state">مفيش حجوزات لسه.</div>}
    </section>
  );
}
