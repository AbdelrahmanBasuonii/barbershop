import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function ResetPasswordPage() {
  const { t } = useLocale();
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();
  const token = searchParams.get('token') || '';

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmation) return setError(t('كلمتا المرور غير متطابقتين.'));
    setBusy(true);
    try {
      await api('password-reset/confirm', { method: 'POST', token: '', body: { token, password } });
      logout();
      setDone(true);
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="auth-page">
        <PageTitle eyebrow={t('تم تحديث حسابك')}>{t('كلمة المرور اتغيرت بنجاح')}</PageTitle>
        <div className="panel form-stack auth-card">
          <p>{t('تقدر دلوقتي تدخل باستخدام كلمة المرور الجديدة.')}</p>
          <button className="button" onClick={() => navigate('/login', { replace: true })}>{t('تسجيل الدخول')}</button>
        </div>
      </section>
    );
  }

  return (
    <section className="auth-page">
      <PageTitle eyebrow={t('حماية حسابك')}>{t('اكتب كلمة مرور جديدة')}</PageTitle>
      <form className="panel form-stack auth-card" onSubmit={submit}>
        {!token && <StatusMessage error>{t('رابط إعادة التعيين غير موجود. اطلب رسالة جديدة.')}</StatusMessage>}
        <label>{t('كلمة المرور الجديدة')}<input type="password" autoComplete="new-password" required minLength={8} value={password} onChange={event => setPassword(event.target.value)} disabled={!token} /></label>
        <label>{t('تأكيد كلمة المرور')}<input type="password" autoComplete="new-password" required minLength={8} value={confirmation} onChange={event => setConfirmation(event.target.value)} disabled={!token} /></label>
        <StatusMessage error>{error}</StatusMessage>
        <button className="button" disabled={busy || !token}>{busy ? t('جارٍ الحفظ...') : t('حفظ كلمة المرور الجديدة')}</button>
        <p className="form-footnote"><Link to="/forgot-password">{t('اطلب رابط إعادة تعيين جديد')}</Link></p>
      </form>
    </section>
  );
}
