import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

const links = [
  ['/', 'الرئيسية'],
  ['/gallery', 'المعرض'],
  ['/videos', 'الفيديوهات'],
  ['/booking', 'احجز دورك'],
  ['/visit', 'العنوان والمواعيد']
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { t, isEnglish, toggleLanguage } = useLocale();
  return (
    <header className="site-header">
      <div className="site-nav">
        <Link className="brand" to="/">{t('حلاّق')}</Link>
        <nav aria-label={t('التنقل الرئيسي')}>
          {links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'}>{t(label)}</NavLink>)}
          {user && <NavLink to="/my-bookings">{t('حجوزاتي')}</NavLink>}
          {user && <NavLink to="/chat">{t('اسألنا')}</NavLink>}
        </nav>
        <div className="nav-account">
          <button className="button button-outline language-toggle" onClick={toggleLanguage} aria-label={t(isEnglish ? 'التبديل إلى العربية' : 'التبديل إلى الإنجليزية')}>{isEnglish ? 'العربية' : 'English'}</button>
          {user?.role === 'admin' && <Link to="/admin">{t('لوحة الأدمن')}</Link>}
          {user ? <><span className="welcome">{t('أهلاً')} {user.fullName.split(' ')[0]}</span><button className="button button-outline" onClick={logout}>{t('خروج')}</button></>
            : <Link className="button" to="/login">{t('دخول / تسجيل')}</Link>}
        </div>
      </div>
    </header>
  );
}
