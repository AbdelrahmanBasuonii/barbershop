import { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { API_BASE_URL, api } from '../api.js';
import AdminPageTitle from './AdminPageTitle.jsx';

export default function AdminChats() {
  const [chats, setChats] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const socketRef = useRef(null);
  const messagesRef = useRef(null);

  async function refresh() {
    const data = await api('admin/chats');
    setChats(data);
    setSelectedId(current => current ?? data[0]?.user.id ?? null);
  }

  useEffect(() => {
    refresh().catch(problem => setError(problem.message));
    const socket = io(API_BASE_URL || undefined, { auth: { token: localStorage.getItem('at') } });
    socketRef.current = socket;
    socket.on('msg', message => setChats(current => {
      const existing = current.find(chat => chat.user.id === message.userId);
      if (existing) return current.map(chat => chat.user.id === message.userId ? { ...chat, msgs: [...chat.msgs, message] } : chat);
      refresh().catch(problem => setError(problem.message));
      return current;
    }));
    socket.on('connect_error', () => setError('تعذر الاتصال بالرسائل المباشرة.'));
    return () => socket.disconnect();
  }, []);

  const activeChat = chats.find(chat => chat.user.id === selectedId);
  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [activeChat?.msgs]);

  function send(event) {
    event.preventDefault();
    if (!selectedId || !text.trim()) return;
    if (!socketRef.current?.connected) return setError('الاتصال غير متاح حالياً.');
    socketRef.current.emit('reply', { userId: selectedId, text: text.trim() });
    setText('');
    setError('');
  }

  return (
    <>
      <AdminPageTitle title="الرسائل" description="تابع استفسارات العملاء ورد عليهم مباشرة." />
      {error && <p className="admin-error">{error}</p>}
      <div className="admin-chat-layout">
        <div className="admin-chat-list">{chats.map(chat => <button type="button" key={chat.user.id} className={chat.user.id === selectedId ? 'active' : ''} onClick={() => setSelectedId(chat.user.id)}>
          <strong>{chat.user.fullName}</strong><span>{chat.msgs.at(-1)?.text || 'محادثة جديدة'}</span>
        </button>)}{!chats.length && <p className="admin-empty">لا توجد محادثات حتى الآن.</p>}</div>
        <section className="admin-chat-conversation">
          <div className="admin-chat-messages" ref={messagesRef}>
            {activeChat?.msgs.map((message, index) => <div key={`${message.at}-${index}`} className={`chat-message ${message.from}`}><span>{message.text}</span></div>)}
            {!activeChat && <p className="admin-empty">اختار محادثة للبدء.</p>}
          </div>
          <form className="chat-form" onSubmit={send}><input value={text} onChange={event => setText(event.target.value)} placeholder="اكتب ردك..." maxLength={500} disabled={!activeChat} /><button className="button" disabled={!activeChat || !text.trim()}>إرسال</button></form>
        </section>
      </div>
    </>
  );
}
