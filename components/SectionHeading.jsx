import { Link } from 'react-router-dom';

export default function SectionHeading({ title, to, children }) {
  return (
    <div className="section-heading">
      <h2>{title}</h2>
      {to && <Link to={to}>{children || 'عرض الكل'} <span aria-hidden="true">←</span></Link>}
    </div>
  );
}
