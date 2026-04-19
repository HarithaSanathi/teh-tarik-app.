import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, subscribeMessages, markMessagesAsRead } from '../admin/services/dataService';
import { db } from '../lib/firebase';
import { addDoc, collection, serverTimestamp, onSnapshot, query, orderBy } from 'firebase/firestore';
import { Send, User, ShieldCheck, Clock, X } from 'lucide-react';

const ChatWindow = ({ orderId, role, senderId, token = null, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!orderId) return;
    console.log("orderId:", orderId);
    
    // Direct real-time listener for messages subcollection
    const q = query(collection(db, "orders", orderId, "messages"), orderBy("createdAt", "asc"));
    
    const unsub = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      // Mark as read when messages arrive
      markMessagesAsRead(orderId, role, token);
    });

    return () => unsub();
  }, [orderId, role, token]);

  useEffect(() => {
    // Scroll to bottom when messages change
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sending) return;

    console.log("Sending message for order:", orderId);
    setSending(true);
    try {
      await addDoc(collection(db, "orders", orderId, "messages"), {
        text: inputText.trim(),
        senderRole: role,
        senderId: senderId,
        createdAt: serverTimestamp()
      });
      setInputText('');
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      background: '#f8fafc',
      borderRadius: '24px',
      overflow: 'hidden',
      boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
      border: '1px solid #e2e8f0'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '20px 24px', 
        background: 'var(--green-dark)', 
        color: 'white', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {role === 'admin' ? <User size={20} /> : <ShieldCheck size={20} color="var(--gold)" />}
          </div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '15px' }}>{role === 'admin' ? 'Customer Chat' : (token ? 'Send a Note' : 'STM Support')}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.6)', fontWeight: 700 }}>Order #{orderId.slice(-8)}</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '8px' }}>
            <X size={20} />
          </button>
        )}
      </div>

      {/* Messages Area / Welcome Area for Guest */}
      <div 
        ref={scrollRef}
        style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '16px' 
        }}
      >
        {messages.length === 0 ? (
          <div style={{ margin: 'auto', textAlign: 'center', padding: '20px' }}>
            <h4 style={{ fontWeight: 900, color: 'var(--green-dark)', marginBottom: '12px' }}>Need to update the kitchen?</h4>
            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>Type your request below. Our staff will see it on the dashboard instantly.</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderRole === role;
            return (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isMe ? 'flex-end' : 'flex-start'
                }}
              >
                <div style={{ 
                  padding: '12px 16px', 
                  borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                  background: isMe ? 'var(--green-dark)' : 'white',
                  color: isMe ? 'white' : '#0f172a',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  border: isMe ? 'none' : '1px solid #e2e8f0',
                  fontSize: '15px',
                  lineHeight: '1.5',
                  fontWeight: 500
                }}>
                  {msg.text}
                </div>
                <div style={{ 
                  marginTop: '4px', 
                  fontSize: '10px', 
                  color: '#94a3b8', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Clock size={10} /> 
                  {msg.createdAt?.toDate 
                    ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now')}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input Area */}
      <form 
        onSubmit={handleSend}
        style={{ 
          padding: '20px 24px', 
          background: 'white', 
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <input 
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message..."
          style={{ 
            flex: 1, 
            padding: '14px 20px', 
            borderRadius: '14px', 
            border: '1.5px solid #f1f5f9', 
            background: '#f8fafc',
            fontSize: '14px',
            outline: 'none',
            fontWeight: 600
          }}
        />
        <button 
          type="submit"
          disabled={!inputText.trim() || sending}
          style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '14px', 
            background: 'var(--green-dark)', 
            color: 'white', 
            border: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            cursor: (!inputText.trim() || sending) ? 'not-allowed' : 'pointer',
            opacity: (!inputText.trim() || sending) ? 0.6 : 1,
            transition: '0.2s transform'
          }}
          onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default ChatWindow;
