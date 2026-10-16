export default function AdminPageTitle({ title, description }) {
  return <div className="admin-page-title"><div><span className="eyebrow">إدارة المحل</span><h1>{title}</h1>{description && <p>{description}</p>}</div></div>;
}
