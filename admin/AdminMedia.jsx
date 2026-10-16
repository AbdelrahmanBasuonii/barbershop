import { useEffect, useState } from 'react';
import { api, assetUrl } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function AdminMedia({ kind }) {
  const { t } = useLocale();
  const isGallery = kind === 'gallery';
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function refresh() {
    const data = await api('public');
    setItems(data[kind]);
  }

  useEffect(() => {
    refresh().catch(problem => setError(problem.message));
  }, [kind]);

  async function add(event) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setError('');
    const form = new FormData(formElement);
    if (!form.get('file')?.size) form.delete('file');
    try {
      await api(`admin/${kind}`, { method: 'POST', body: form });
      formElement.reset();
      await refresh();
    } catch (problem) {
      setError(problem.message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(t('متأكد إنك عايز تحذف العنصر ده؟'))) return;
    try {
      await api(`admin/${kind}/${id}`, { method: 'DELETE' });
      await refresh();
    } catch (problem) {
      setError(problem.message);
    }
  }

  return (
    <>
      <AdminPageTitle title={isGallery ? 'المعرض' : 'الفيديوهات'} description={isGallery ? 'أضف صور شغلك أو احذف الصور القديمة.' : 'أضف فيديوهات المحل أو احذف الموجود.'} />
      {error && <p className="admin-error">{error}</p>}
      <form className="admin-form admin-media-form" onSubmit={add}>
        <label>{t('العنوان')}<input name="title" placeholder={t('عنوان العنصر')} /></label>
        <label>{t('الرابط (اختياري)')}<input name="url" placeholder={t(isGallery ? 'رابط الصورة' : 'رابط يوتيوب أو الفيديو')} /></label>
        <label>{t('أو ارفع ملفاً')}<input type="file" name="file" accept={isGallery ? 'image/*' : 'video/*'} /></label>
        <button className="button" disabled={saving}>{saving ? t('جارٍ الإضافة...') : t('إضافة')}</button>
      </form>
      <div className="admin-media-grid">
        {items.map(item => <article className="admin-media-item" key={item.id}>
          {isGallery ? <img src={assetUrl(item.url)} alt={item.title ? t(item.title) : t('صورة من المعرض')} /> : <p className="media-link">{assetUrl(item.url)}</p>}
          <strong>{item.title ? t(item.title) : t(isGallery ? 'صورة بدون عنوان' : 'فيديو بدون عنوان')}</strong>
          <button className="button button-outline" onClick={() => remove(item.id)}>{t('حذف')}</button>
        </article>)}
      </div>
      {!items.length && <p className="admin-empty">{t('لسه مفيش محتوى هنا.')}</p>}
    </>
  );
}
