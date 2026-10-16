import { useEffect, useState } from 'react';
import { api, daysOfWeek } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

const emptySettings = { name: '', address: '', phone: '', mapUrl: '', openTime: '', closeTime: '', slotMinutes: 30, offDays: [] };

export default function AdminSettings() {
  const [settings, setSettings] = useState(emptySettings);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api('public').then(data => {
      setSettings({ ...emptySettings, ...data.settings });
      setServices(data.services);
    }).catch(problem => setError(problem.message));
  }, []);

  function updateService(id, field, value) {
    setServices(current => current.map(service => service.id === id ? { ...service, [field]: field === 'price' ? Number(value) : value } : service));
  }

  function addService() {
    setServices(current => [...current, { id: Date.now(), name: '', price: 0 }]);
  }

  function removeService(id) {
    setServices(current => current.filter(service => service.id !== id));
  }

  async function save(event) {
    event.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      await api('admin/settings', { method: 'PUT', body: { settings, services } });
      setMessage('تم حفظ الإعدادات والخدمات.');
    } catch (problem) {
      setError(problem.message);
    } finally {
      setSaving(false);
    }
  }

  function toggleDay(day) {
    setSettings(current => ({
      ...current,
      offDays: current.offDays.includes(day) ? current.offDays.filter(value => value !== day) : [...current.offDays, day].sort()
    }));
  }

  return (
    <>
      <AdminPageTitle title="الإعدادات" description="بيانات المحل ومواعيد العمل والخدمات المعروضة للعميل." />
      {error && <p className="admin-error">{error}</p>}
      {message && <p className="admin-success">{message}</p>}
      <form className="admin-settings-form" onSubmit={save}>
        <section className="admin-panel">
          <h2>بيانات المحل</h2>
          <div className="admin-form-grid">
            {[
              ['name', 'اسم المحل', 'text'],
              ['address', 'العنوان', 'text'],
              ['phone', 'رقم التليفون', 'tel'],
              ['mapUrl', 'رابط خريطة (embed)', 'url'],
              ['openTime', 'بداية العمل', 'time'],
              ['closeTime', 'نهاية العمل', 'time'],
              ['slotMinutes', 'مدة الموعد بالدقائق', 'number']
            ].map(([key, label, type]) => <label key={key}>{label}<input type={type} min={type === 'number' ? 5 : undefined} value={settings[key] ?? ''} onChange={event => setSettings(current => ({ ...current, [key]: type === 'number' ? Number(event.target.value) : event.target.value }))} required={key !== 'mapUrl'} /></label>)}
          </div>
          <fieldset className="days-fieldset"><legend>أيام الإجازة</legend>{daysOfWeek.map((day, index) => <label className="checkbox-label" key={day}><input type="checkbox" checked={settings.offDays.includes(index)} onChange={() => toggleDay(index)} />{day}</label>)}</fieldset>
        </section>
        <section className="admin-panel">
          <div className="admin-section-heading"><div><h2>خدمات الحلاقة</h2><p>كل خدمة هتظهر للعميل كبطاقة مستقلة عند الحجز.</p></div><button type="button" className="button button-outline" onClick={addService}>إضافة خدمة</button></div>
          <div className="admin-service-list">
            {services.map(service => <div className="admin-service-row" key={service.id}>
              <label>اسم الخدمة<input value={service.name} onChange={event => updateService(service.id, 'name', event.target.value)} required /></label>
              <label>السعر بالجنيه<input type="number" min="0" value={service.price} onChange={event => updateService(service.id, 'price', event.target.value)} required /></label>
              <button type="button" className="button button-danger" onClick={() => removeService(service.id)} aria-label={`حذف خدمة ${service.name || ''}`}>حذف</button>
            </div>)}
            {!services.length && <p className="admin-empty">أضف خدمة واحدة على الأقل.</p>}
          </div>
        </section>
        <button className="button button-large" disabled={saving || !services.length}>{saving ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}</button>
      </form>
    </>
  );
}
