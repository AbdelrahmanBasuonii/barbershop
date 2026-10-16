export default function ServiceCard({ service, selected, onSelect }) {
  const Card = onSelect ? 'button' : 'article';
  return (
    <Card type={onSelect ? 'button' : undefined} className={`service-card${onSelect ? ' interactive' : ''}${selected ? ' selected' : ''}`} onClick={onSelect ? () => onSelect(service) : undefined} aria-pressed={onSelect ? Boolean(selected) : undefined}>
      <span className="service-icon" aria-hidden="true">✂</span>
      <strong>{service.name}</strong>
      <span className="service-price">{service.price} <small>جنيه</small></span>
      {onSelect && <span className="service-select">{selected ? 'تم الاختيار' : 'اختار الخدمة'}</span>}
    </Card>
  );
}
