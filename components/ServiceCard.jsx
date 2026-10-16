import { useLocale } from '../context/LocaleContext.jsx';

export default function ServiceCard({ service, selected, onSelect }) {
  const { t, isEnglish } = useLocale();
  const Card = onSelect ? 'button' : 'article';
  return (
    <Card type={onSelect ? 'button' : undefined} className={`service-card${onSelect ? ' interactive' : ''}${selected ? ' selected' : ''}`} onClick={onSelect ? () => onSelect(service) : undefined} aria-pressed={onSelect ? Boolean(selected) : undefined}>
      <span className="service-icon" aria-hidden="true">✂</span>
      <strong>{t(service.name)}</strong>
      <span className="service-price">{service.price} <small>{t('جنيه')}</small></span>
      {onSelect && <span className="service-select">{selected ? t('تم الاختيار') : t('اختار الخدمة')}</span>}
    </Card>
  );
}
