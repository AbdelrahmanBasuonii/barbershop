import { useEffect, useState } from 'react';
import { api } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

export default function AdminMedia({ kind }) {
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
    if (!window.confirm('متأكد إنك عايز تحذف العنصر ده؟')) return;
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
        <label>العنوان<input name="title" placeholder="عنوان العنصر" /></label>
        <label>الرابط (اختياري)<input name="url" placeholder={isGallery ? 'رابط الصورة' : 'رابط يوتيوب أو الفيديو'} /></label>
        <label>أو ارفع ملفاً<input type="file" name="file" accept={isGallery ? 'image/*' : 'video/*'} /></label>
        <button className="button" disabled={saving}>{saving ? 'جارٍ الإضافة...' : 'إضافة'}</button>
      </form>
      <div className="admin-media-grid">
        {items.map(item => <article className="admin-media-item" key={item.id}>
          {isGallery ? <img src={item.url} alt={item.title || 'صورة من المعرض'} /> : <p className="media-link">{item.url}</p>}
          <strong>{item.title || (isGallery ? 'صورة بدون عنوان' : 'فيديو بدون عنوان')}</strong>
          <button className="button button-outline" onClick={() => remove(item.id)}>حذف</button>
        </article>)}
      </div>
      {!items.length && <p className="admin-empty">لسه مفيش محتوى هنا.</p>}
    </>
  );
}
