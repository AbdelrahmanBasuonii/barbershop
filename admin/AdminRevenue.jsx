import { useEffect, useState } from 'react';
import { api, bookingStatuses } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AdminRevenue() {
  const { t, isEnglish } = useLocale();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api('admin/bookings')
      .then(data => setBookings(data.filter(booking => booking.status === 'done')))
      .catch(problem => setError(problem.message));
  }, []);

  const total = bookings.reduce((sum, booking) => sum + Number(booking.price || 0), 0);

  return (
    <>
      <AdminPageTitle title="تفاصيل الإيرادات" description="الإيرادات المحسوبة من الحجوزات المكتملة فقط." />
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-revenue-summary">
        <span>{t('إجمالي الإيراد')}</span>
        <strong>{new Intl.NumberFormat(isEnglish ? 'en-US' : 'ar-EG').format(total)} {t('جنيه')}</strong>
        <small>{bookings.length} {t('حجز مكتمل')}</small>
      </div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>{t('التاريخ')}</th><th>{t('الوقت')}</th><th>{t('العميل')}</th><th>{t('الخدمة')}</th><th>{t('المبلغ')}</th><th>{t('الحالة')}</th></tr></thead>
        <tbody>{bookings.map(booking => <tr key={booking.id}>
          <td>{booking.date}</td><td>{booking.time}</td><td>{booking.customer.fullName || '—'}</td>
          <td>{t(booking.service)}</td><td>{Number(booking.price || 0).toLocaleString(isEnglish ? 'en-US' : 'ar-EG')} {t('جنيه')}</td>
          <td>{bookingStatuses[booking.status]}</td>
        </tr>)}</tbody>
      </table>{!bookings.length && !error && <p className="admin-empty">{t('لا توجد إيرادات حتى الآن؛ تظهر الإيرادات عند تحويل الحجز إلى «تم».')}</p>}</div>
    </>
  );
}
