import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

const links = [
  ['/admin', 'نظرة عامة', true],
  ['/admin/bookings', 'الحجوزات'],
  ['/admin/revenue', 'الإيرادات'],
  ['/admin/customers', 'العملاء'],
  ['/admin/gallery', 'المعرض'],
  ['/admin/videos', 'الفيديوهات'],
  ['/admin/chats', 'الرسائل'],
  ['/admin/settings', 'الإعدادات']
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const { t, isEnglish, toggleLanguage } = useLocale();
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin">{t('لوحة التحكم')}<span>{t('إدارة المحل')}</span></NavLink>
        <nav aria-label={t('قائمة الإدارة')}>
          {links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{t(label)}</NavLink>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>{user?.fullName}</span>
          <button className="button button-outline language-toggle" onClick={toggleLanguage}>{isEnglish ? 'العربية' : 'English'}</button>
          <NavLink to="/">{t('عرض الموقع')}</NavLink>
          <button className="admin-logout" onClick={logout}>{t('تسجيل الخروج')}</button>
        </div>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  );
}
