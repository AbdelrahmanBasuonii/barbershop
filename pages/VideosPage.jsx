import { useEffect, useState } from 'react';
import { api } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import VideoGrid from '../components/VideoGrid.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function VideosPage() {
  const { t } = useLocale();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    api('public').then(data => setItems(data.videos)).catch(problem => setError(problem.message));
  }, []);
  return <section className="content-section"><PageTitle eyebrow={t('من جوه المحل')} description={t('لقطات من شغلنا وأجواء المكان.')}>{t('فيديوهات')}</PageTitle><StatusMessage error>{error}</StatusMessage><VideoGrid items={items} /></section>;
}
