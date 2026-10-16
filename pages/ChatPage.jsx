import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../api.js';
import PageTitle from '../components/PageTitle.jsx';
import StatusMessage from '../components/StatusMessage.jsx';

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('t');
    const socket = io(API_BASE_URL || undefined, { auth: { token } });
    socketRef.current = socket;
    socket.on('history', setMessages);
    socket.on('msg', message => setMessages(current => [...current, message]));
    socket.on('connect_error', () => setError('تعذر الاتصال بالدردشة. جرّب تحديث الصفحة.'));
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages]);

  function send(event) {
    event.preventDefault();
    const message = text.trim();
    if (!message) return;
    if (!socketRef.current?.connected) return setError('الاتصال بالدردشة غير متاح حالياً.');
    socketRef.current.emit('say', message);
    setText('');
    setError('');
  }

  return (
    <section className="content-section chat-page">
      <PageTitle eyebrow="إحنا هنا لمساعدتك" description="اسأل عن الأسعار أو المواعيد أو أي حاجة تانية.">اسألنا</PageTitle>
      <StatusMessage error>{error}</StatusMessage>
      <div className="chat-window panel">
        <div className="chat-messages" ref={messagesRef} aria-live="polite">
          {messages.length === 0 && <div className="chat-welcome">أهلاً بيك! ابعتلنا سؤالك وهنرد عليك.</div>}
          {messages.map((message, index) => <div className={`chat-message ${message.from}`} key={`${message.at}-${index}`}>
            {message.from !== 'user' && <small>{message.from === 'bot' ? 'مساعد آلي' : 'فريق المحل'}</small>}
            <span>{message.text}</span>
          </div>)}
        </div>
        <form className="chat-form" onSubmit={send}>
          <input value={text} onChange={event => setText(event.target.value)} placeholder="اكتب رسالتك..." autoComplete="off" maxLength={500} aria-label="رسالتك" />
          <button className="button" disabled={!text.trim()}>إرسال</button>
        </form>
      </div>
    </section>
  );
}
