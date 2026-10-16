import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import PageTitle from './PageTitle.jsx';
import StatusMessage from './StatusMessage.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AuthForm({ register = false, admin = false }) {
  const { login, register: createAccount } = useAuth();
  const { t } = useLocale();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError('');
    setBusy(true);
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    data.email = data.email.trim();
    if (register) {
      data.fullName = data.fullName.trim().replace(/\s+/g, ' ');
      data.phone = data.phone.trim();
    }
    try {
      if (register) await createAccount(data);
      else await login(data, admin ? 'admin' : undefined);
      const destination = admin ? '/admin' : register ? '/my-bookings' : location.state?.from?.pathname || '/my-bookings';
      navigate(destination, { replace: true });
    } catch (problem) {
      setError(problem.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-page">
      <PageTitle eyebrow={t(admin ? 'الإدارة' : 'حسابك')}>{t(register ? 'إنشاء حساب جديد' : admin ? 'دخول الأدمن' : 'أهلاً بيك')}</PageTitle>
      <form className="panel form-stack auth-card" onSubmit={submit}>
        {register && <>
          <label>{t('الاسم بالكامل')}<input name="fullName" autoComplete="name" required minLength="3" pattern=".*\s+.*" title={t('اكتب الاسم الأول واسم العائلة')} /></label>
          <label>{t('رقم التليفون')}<input name="phone" type="tel" inputMode="tel" autoComplete="tel" required minLength="10" maxLength="15" pattern="[0-9+]{10,15}" title={t('اكتب رقم تليفون من 10 إلى 15 رقمًا')} /></label>
        </>}
        <label>{t('الإيميل')}<input name="email" type="email" autoComplete="email" required /></label>
        <label>{t('الباسورد')}<input name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} required minLength={register ? 8 : undefined} /></label>
        <StatusMessage error>{error}</StatusMessage>
        <button className="button" disabled={busy}>{busy ? t('لحظة واحدة...') : t(register ? 'إنشاء الحساب' : 'دخول')}</button>
        {!register && !admin && <Link className="forgot-password-link" to="/forgot-password">{t('نسيت كلمة المرور؟')}</Link>}
        {!admin && <p className="form-footnote">{t(register ? 'عندك حساب؟' : 'لسه معندكش حساب؟')} <Link to={register ? '/login' : '/register'}>{t(register ? 'سجّل دخول' : 'إنشاء حساب جديد')}</Link></p>}
      </form>
    </section>
  );
}
