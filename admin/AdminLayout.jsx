import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

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
  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <NavLink className="admin-brand" to="/admin">لوحة التحكم<span>إدارة المحل</span></NavLink>
        <nav aria-label="قائمة الإدارة">
          {links.map(([to, label, end]) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
        </nav>
        <div className="admin-sidebar-bottom">
          <span>{user?.fullName}</span>
          <NavLink to="/">عرض الموقع</NavLink>
          <button className="admin-logout" onClick={logout}>تسجيل الخروج</button>
        </div>
      </aside>
      <main className="admin-content"><Outlet /></main>
    </div>
  );
}
