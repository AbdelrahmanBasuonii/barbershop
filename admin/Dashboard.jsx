import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

const cards = [
  ['customers', 'العملاء', '/admin/customers', 'عرض تفاصيل العملاء'],
  ['bookings', 'كل الحجوزات', '/admin/bookings', 'عرض كل الحجوزات'],
  ['today', 'حجوزات اليوم', '/admin/bookings?filter=today', 'عرض حجوزات اليوم'],
  ['pending', 'بانتظار التأكيد', '/admin/bookings?status=pending', 'عرض الحجوزات المنتظرة'],
  ['revenue', 'الإيراد (جنيه)', '/admin/revenue', 'عرض تفاصيل الإيرادات']
];

export default function Dashboard() {
  const { t, isEnglish } = useLocale();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api('admin/stats').then(setStats).catch(problem => setError(problem.message));
  }, []);
  return (
    <>
      <AdminPageTitle title="نظرة عامة" description="ملخص سريع لحركة المحل." />
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-stat-grid">{cards.map(([key, label, to, description]) => (
        <Link className="admin-stat-card" key={key} to={to} aria-label={`${t(description)}: ${stats?.[key] ?? '—'}`}>
          <span>{t(label)}</span><strong>{stats?.[key] ?? '—'}</strong><small>{t('اضغط لعرض التفاصيل')} <span aria-hidden="true">{isEnglish ? '→' : '←'}</span></small>
        </Link>
      ))}</div>
    </>
  );
}
