import { Link } from 'react-router-dom';
import { useLocale } from '../context/LocaleContext.jsx';

export default function SectionHeading({ title, to, children }) {
  const { t, isEnglish } = useLocale();
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to && <Link to={to}>{children || t('عرض الكل')} <span aria-hidden="true">{isEnglish ? '→' : '←'}</span></Link>}
    </div>
  );
}
