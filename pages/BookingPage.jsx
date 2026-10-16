import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTitle from '../components/PageTitle.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [date, setDate] = useState('');
  const [slots, setSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api('public').then(data => setServices(data.services)).catch(problem => setError(problem.message));
  }, []);

  async function loadSlots(value) {
    setDate(value);
    setSelectedTime('');
    setMessage('');
    if (!value) return setSlots([]);
    try {
      setSlots(await api(`slots?date=${encodeURIComponent(value)}`));
    } catch (problem) {
      setError(problem.message);
    }
  }

  async function book() {
    setMessage('');
    if (!user) return setMessage('سجّل الدخول الأول عشان تقدر تحجز.');
    if (!selectedService) return setMessage('اختار الخدمة اللي تناسبك الأول.');
    if (!date || !selectedTime) return setMessage('اختار اليوم والوقت المناسبين.');
    try {
      await api('bookings', { method: 'POST', body: { date, time: selectedTime, serviceId: selectedService.id } });
      setMessage('تم الحجز، وهنأكد معاك قريباً.');
      setSelectedTime('');
      setSlots(await api(`slots?date=${encodeURIComponent(date)}`));
    } catch (problem) {
      setMessage(problem.message);
    }
  }

  const today = new Date();
  const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return (
    <section className="content-section">
      <PageTitle eyebrow="حجز سهل وسريع" description="اختار الخدمة، وبعدها اليوم والوقت المناسبين ليك.">احجز دورك</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      <div className="booking-layout">
        <div className="booking-main">
          <section className="booking-step"><div className="step-heading"><span>١</span><div><h2>اختار الخدمة</h2><p>كل خدمة بسعرها، اختار اللي يناسبك.</p></div></div>
            <div className="service-grid">{services.map(service => <ServiceCard key={service.id} service={service} selected={selectedService?.id === service.id} onSelect={setSelectedService} />)}</div>
          </section>
          <section className="booking-step"><div className="step-heading"><span>٢</span><div><h2>اختار اليوم والميعاد</h2><p>المواعيد المتاحة هتظهر بعد اختيار اليوم.</p></div></div>
            <label className="date-field">اليوم<input type="date" min={minDate} value={date} onChange={event => loadSlots(event.target.value)} /></label>
            <div className="slot-grid">{slots.map(slot => <button type="button" key={slot.time} disabled={!slot.free} aria-pressed={selectedTime === slot.time} className={`slot-button${selectedTime === slot.time ? ' selected' : ''}`} onClick={() => setSelectedTime(slot.time)}>{slot.time}</button>)}
              {date && slots.length === 0 && <p className="muted">اليوم ده إجازة أو مفيش مواعيد.</p>}
              {!date && <p className="muted">اختار اليوم الأول عشان نشوف المواعيد.</p>}
            </div>
          </section>
          <div className="booking-submit">
            <button type="button" className="button button-large" onClick={book}>تأكيد الحجز</button>
            <StatusMessage error={message.includes('اختار') || message.includes('سجّل') || message.includes('فشل')}>{message}</StatusMessage>
            {!user && <Link to="/login">دخول أو إنشاء حساب</Link>}
          </div>
        </div>
        <aside className="booking-summary panel"><span className="eyebrow">ملخص الحجز</span><h2>{selectedService?.name || 'اختار الخدمة'}</h2><p>{date || 'اليوم لم يتحدد'}{selectedTime ? ` • ${selectedTime}` : ''}</p><strong>{selectedService ? `${selectedService.price} جنيه` : '—'}</strong></aside>
      </div>
    </section>
  );
}
