import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function RequireAuth({ children, admin = false }) {
  const { user, loading } = useAuth();
  const { t } = useLocale();
  const location = useLocation();
  if (loading) return <p className="status-message">{t('جارٍ التحقق من تسجيل الدخول...')}</p>;
  if (!user) return <Navigate to={admin ? '/admin/login' : '/login'} state={{ from: location }} replace />;
  if (admin && user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
}
