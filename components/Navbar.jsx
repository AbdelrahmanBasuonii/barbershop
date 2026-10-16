import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  ['/', 'الرئيسية'],
  ['/gallery', 'المعرض'],
  ['/videos', 'الفيديوهات'],
  ['/booking', 'احجز دورك'],
  ['/visit', 'العنوان والمواعيد']
];

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link className="brand" to="/">حلاّق</Link>
        <nav aria-label="التنقل الرئيسي">
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{label}</NavLink>)}
          {user && <NavLink to="/my-bookings">حجوزاتي</NavLink>}
          {user && <NavLink to="/chat">اسألنا</NavLink>}
        </nav>
        <div className="nav-account">
          {user?.role === 'admin' && <Link to="/admin">لوحة الأدمن</Link>}
          {user ? <><span className="welcome">أهلاً {user.fullName.split(' ')[0]}</span><button className="button button-outline" onClick={logout}>خروج</button></>
            : <Link className="button" to="/login">دخول / تسجيل</Link>}
        </div>
      </div>
    </header>
  );
}
