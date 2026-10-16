import { useLocale } from '../context/LocaleContext.jsx';

export default function AdminPageTitle({ title, description }) {
  const { t } = useLocale();
  return <div className="admin-page-title"><div><span className="eyebrow">{t('إدارة المحل')}</span><h1>{t(title)}</h1>{description && <p>{t(description)}</p>}</div></div>;
}
