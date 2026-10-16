import VideoPlayer from './VideoPlayer.jsx';

export default function VideoGrid({ items = [] }) {
  if (!items.length) return <div className="empty-state">الفيديوهات قريباً.</div>;
  return <div className="video-grid">{items.map(video => <VideoPlayer key={video.id} video={video} />)}</div>;
}
