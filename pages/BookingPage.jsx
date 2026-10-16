import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTitle from '../components/PageTitle.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function BookingPage() {
  const { user } = useAuth();
  const { t } = useLocale();
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
    if (!user) return setMessage(t('سجّل الدخول الأول عشان تقدر تحجز.'));
    if (!selectedService) return setMessage(t('اختار الخدمة اللي تناسبك الأول.'));
    if (!date || !selectedTime) return setMessage(t('اختار اليوم والوقت المناسبين.'));
    try {
      await api('bookings', { method: 'POST', body: { date, time: selectedTime, serviceId: selectedService.id } });
      setMessage(t('تم الحجز، وهنأكد معاك قريباً.'));
      setSelectedTime('');
      setSlots(await api(`slots?date=${encodeURIComponent(date)}`));
    } catch (problem) {
      setMessage(t(problem.message));
    }
  }

  const today = new Date();
  const minDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  return (
    <section className="content-section">
      <PageTitle eyebrow={t('حجز سهل وسريع')} description={t('اختار الخدمة، وبعدها اليوم والوقت المناسبين ليك.')}>{t('احجز دورك')}</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      <div className="booking-layout">
        <div className="booking-main">
          <section className="booking-step"><div className="step-heading"><span>1</span><div><h2>{t('اختار الخدمة')}</h2><p>{t('كل خدمة بسعرها، اختار اللي يناسبك.')}</p></div></div>
            <div className="service-grid">{services.map(service => <ServiceCard key={service.id} service={service} selected={selectedService?.id === service.id} onSelect={setSelectedService} />)}</div>
          </section>
          <section className="booking-step"><div className="step-heading"><span>2</span><div><h2>{t('اختار اليوم والميعاد')}</h2><p>{t('المواعيد المتاحة هتظهر بعد اختيار اليوم.')}</p></div></div>
            <label className="date-field">{t('اليوم')}<input type="date" min={minDate} value={date} onChange={event => loadSlots(event.target.value)} /></label>
            <div className="slot-grid">{slots.map(slot => <button type="button" key={slot.time} disabled={!slot.free} aria-pressed={selectedTime === slot.time} className={`slot-button${selectedTime === slot.time ? ' selected' : ''}`} onClick={() => setSelectedTime(slot.time)}>{slot.time}</button>)}
              {date && slots.length === 0 && <p className="muted">{t('اليوم ده إجازة أو مفيش مواعيد.')}</p>}
              {!date && <p className="muted">{t('اختار اليوم الأول عشان نشوف المواعيد.')}</p>}
            </div>
          </section>
          <div className="booking-submit">
            <button type="button" className="button button-large" onClick={book}>{t('تأكيد الحجز')}</button>
            <StatusMessage error={Boolean(message && message !== t('تم الحجز، وهنأكد معاك قريباً.'))}>{message}</StatusMessage>
            {!user && <Link to="/login">{t('دخول أو إنشاء حساب')}</Link>}
          </div>
        </div>
        <aside className="booking-summary panel"><span className="eyebrow">{t('ملخص الحجز')}</span><h2>{selectedService ? t(selectedService.name) : t('اختار الخدمة')}</h2><p>{date || t('اليوم لم يتحدد')}{selectedTime ? ` • ${selectedTime}` : ''}</p><strong>{selectedService ? `${selectedService.price} ${t('جنيه')}` : '—'}</strong></aside>
      </div>
    </section>
  );
}
