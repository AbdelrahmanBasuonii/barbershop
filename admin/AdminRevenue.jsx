import { useEffect, useState } from 'react';
import { api, bookingStatuses } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

export default function AdminRevenue() {
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
        <span>إجمالي الإيراد</span>
        <strong>{total.toLocaleString('ar-EG')} جنيه</strong>
        <small>{bookings.length} حجز مكتمل</small>
      </div>
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>التاريخ</th><th>الوقت</th><th>العميل</th><th>الخدمة</th><th>المبلغ</th><th>الحالة</th></tr></thead>
        <tbody>{bookings.map(booking => <tr key={booking.id}>
          <td>{booking.date}</td><td>{booking.time}</td><td>{booking.customer.fullName || '—'}</td>
          <td>{booking.service}</td><td>{Number(booking.price || 0).toLocaleString('ar-EG')} ج</td>
          <td>{bookingStatuses[booking.status]}</td>
        </tr>)}</tbody>
      </table>{!bookings.length && !error && <p className="admin-empty">لا توجد إيرادات حتى الآن؛ تظهر الإيرادات عند تحويل الحجز إلى «تم».</p>}</div>
    </>
  );
}
