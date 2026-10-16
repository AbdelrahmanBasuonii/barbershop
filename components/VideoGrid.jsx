import VideoPlayer from './VideoPlayer.jsx';
import { useLocale } from '../context/LocaleContext.jsx';

export default function VideoGrid({ items = [] }) {
  const { t } = useLocale();
  if (!items.length) return <div className="empty-state">{t('الفيديوهات قريباً.')}</div>;
  return <div className="video-grid">{items.map(video => <VideoPlayer key={video.id} video={video} />)}</div>;
}
