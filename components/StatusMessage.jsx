export default function StatusMessage({ children, error = false }) {
  if (!children) return null;
  return <p className={error ? 'status-message error-message' : 'status-message'} role={error ? 'alert' : 'status'}>{children}</p>;
}
