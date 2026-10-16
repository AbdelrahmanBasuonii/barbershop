import { useLocale } from '../context/LocaleContext.jsx';

export default function StatusMessage({ children, error = false }) {
  const { t } = useLocale();
  if (!children) return null;
  const message = typeof children === 'string' ? t(children) : children;
  return <p className={error ? 'status-message error-message' : 'status-message'} role={error ? 'alert' : 'status'}>{message}</p>;
}
