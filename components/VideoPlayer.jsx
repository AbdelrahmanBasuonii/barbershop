import { assetUrl } from '../api.js';

export default function VideoPlayer({ video }) {
  const match = video.url?.match(/(?:youtu\.be\/|v=|embed\/)([\w-]{11})/);
  return (
    <article className="video-card">
      {match
        ? <iframe className="video-frame" src={`https://www.youtube-nocookie.com/embed/${match[1]}`} title={video.title || 'فيديو محل الحلاقة'} allowFullScreen loading="lazy" />
        : <video className="video-frame" src={assetUrl(video.url)} title={video.title || 'فيديو محل الحلاقة'} controls preload="metadata" />}
      {video.title && <h3>{video.title}</h3>}
    </article>
  );
}
