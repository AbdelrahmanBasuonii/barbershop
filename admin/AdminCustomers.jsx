import { useEffect, useState } from 'react';
import { api } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AdminCustomers() {
  const { t, isEnglish } = useLocale();
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api('admin/customers').then(setCustomers).catch(problem => setError(problem.message));
  }, []);
  return (
    <>
      <AdminPageTitle title={isEnglish ? `Customers${customers.length ? ` (${customers.length})` : ''}` : `العملاء${customers.length ? ` (${customers.length})` : ''}`} description="قائمة العملاء المسجلين في الموقع." />
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-table-wrap"><table className="admin-table">
        <thead><tr><th>{t('الاسم')}</th><th>{t('الإيميل')}</th><th>{t('التليفون')}</th><th>{t('الحجوزات')}</th><th>{t('تاريخ التسجيل')}</th></tr></thead>
        <tbody>{customers.map(customer => <tr key={customer.id}>
          <td>{customer.fullName}</td><td>{customer.email}</td><td>{customer.phone}</td><td>{customer.bookings}</td>
          <td>{new Date(customer.createdAt).toLocaleDateString(isEnglish ? 'en-US' : 'ar-EG')}</td>
        </tr>)}</tbody>
      </table>{!customers.length && !error && <p className="admin-empty">{t('لا يوجد عملاء حتى الآن.')}</p>}</div>
    </>
  );
}
