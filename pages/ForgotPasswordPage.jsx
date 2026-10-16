import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setBusy(true);
    try {
      const result = await api('password-reset/request', {
        method: 'POST',
        token: '',
        body: { email: email.trim() }
      });
      setMessage(result.message);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <PageTitle eyebrow="استعادة الحساب" description="هنبعتلك رابط آمن لإعادة تعيين كلمة المرور على بريدك الإلكتروني.">نسيت كلمة المرور؟</PageTitle>
      <form className="panel form-stack auth-card" onSubmit={submit}>
        <label>الإيميل المسجل في حسابك<input type="email" name="email" autoComplete="email" required value={email} onChange={event => setEmail(event.target.value)} /></label>
        <StatusMessage error>{error}</StatusMessage>
        <StatusMessage>{message}</StatusMessage>
        <button className="button" disabled={busy}>{busy ? 'جارٍ الإرسال...' : 'إرسال رابط إعادة التعيين'}</button>
        <p className="form-footnote"><Link to="/login">العودة لتسجيل الدخول</Link></p>
      </form>
    </section>
  );
}
