import { useLocale } from '../context/LocaleContext.jsx';

export default function Footer() {
  const { t } = useLocale();
  return <footer className="site-footer"><span>{t('حلاقة على مزاجك، وميعادك علينا.')}</span><span>© {new Date().getFullYear()} {t('محل الحلاقة')}</span></footer>;
}
