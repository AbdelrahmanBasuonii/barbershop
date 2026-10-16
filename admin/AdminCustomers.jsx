import { useEffect, useState } from 'react';
import { api } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api('admin/customers').then(setCustomers).catch(problem => setError(problem.message));
  }, []);
  return (
    <>
      <AdminPageTitle title={`العملاء${customers.length ? ` (${customers.length})` : ''}`} description="قائمة العملاء المسجلين في الموقع." />
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>الاسم</th><th>الإيميل</th><th>التليفون</th><th>الحجوزات</th><th>تاريخ التسجيل</th></tr></thead>
        <tbody>{customers.map(customer => <tr key={customer.id}>
          <td>{customer.fullName}</td><td>{customer.email}</td><td>{customer.phone}</td><td>{customer.bookings}</td>
          <td>{new Date(customer.createdAt).toLocaleDateString('ar-EG')}</td>
        </tr>)}</tbody>
      </table>{!customers.length && !error && <p className="admin-empty">لا يوجد عملاء حتى الآن.</p>}</div>
    </>
  );
}
