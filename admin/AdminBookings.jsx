import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api, bookingStatuses } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

export default function AdminBookings() {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const refresh = useCallback(() => api('admin/bookings').then(setBookings).catch(problem => setError(problem.message)), []);
  useEffect(() => { refresh(); }, [refresh]);

  const statusFilter = searchParams.get('status');
  const todayFilter = searchParams.get('filter') === 'today';
  const today = new Date();
  const todayString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const filteredBookings = bookings.filter(booking => {
    if (statusFilter && booking.status !== statusFilter) return false;
    if (todayFilter && booking.date !== todayString) return false;
    return true;
  });
  const title = todayFilter ? 'حجوزات اليوم' : statusFilter === 'pending' ? bookingStatuses.pending : 'كل الحجوزات';

  async function updateStatus(id, status) {
    try {
      await api(`admin/bookings/${id}`, { method: 'PATCH', body: { status } });
      await refresh();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <>
      <AdminPageTitle title={title} description={`عدد الحجوزات المعروضة: ${filteredBookings.length}. راجع التفاصيل وحدّث حالة كل حجز.`} />
      {error && <p className="admin-error">{error}</p>}
      {(statusFilter || todayFilter) && <p className="admin-filter-link"><Link to="/admin/bookings">عرض كل الحجوزات</Link></p>}
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>التاريخ</th><th>الوقت</th><th>العميل</th><th>التليفون</th><th>الخدمة</th><th>الحالة</th></tr></thead>
        <tbody>{filteredBookings.map(booking => <tr key={booking.id}>
          <td>{booking.date}</td><td>{booking.time}</td><td>{booking.customer.fullName || '—'}</td><td>{booking.customer.phone || '—'}</td>
          <td>{booking.service} ({booking.price} ج)</td>
          <td><select value={booking.status} onChange={event => updateStatus(booking.id, event.target.value)} aria-label={`حالة حجز ${booking.customer.fullName || ''}`}>
            {Object.entries(bookingStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select></td>
        </tr>)}</tbody>
      </table>{!filteredBookings.length && <p className="admin-empty">{bookings.length ? 'لا توجد حجوزات تطابق هذا الاختيار.' : 'لا توجد حجوزات حتى الآن.'}</p>}</div>
    </>
  );
}
