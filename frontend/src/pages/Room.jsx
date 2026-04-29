import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext';

const Room = () => {
  const { roomId } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [roomData, setRoomData] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [onlineUsers, setOnlineUsers] = useState([]);
  const typingTimeoutRef = useRef(null);
  
  const messagesEndRef = useRef(null);

  // Scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingUsers]);

  // Fetch initial room data and messages
  useEffect(() => {
    const fetchRoomData = async () => {
      try {
        const [roomRes, msgsRes] = await Promise.all([
          axios.get(`http://localhost:5000/api/rooms`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`http://localhost:5000/api/messages/${roomId}`, { headers: { Authorization: `Bearer ${token}` } })
        ]);
        
        const currentRoom = roomRes.data.find(r => r._id === roomId);
        if (!currentRoom) {
          navigate('/chat');
          return;
        }
        
        setRoomData(currentRoom);
        setMessages(msgsRes.data);
      } catch (error) {
        console.error('Error fetching room/messages:', error);
        navigate('/chat');
      }
    };

    fetchRoomData();
  }, [roomId, token, navigate]);

  // Socket connection setup
  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      withCredentials: true,
    });
    setSocket(newSocket);

    newSocket.emit('joinRoom', { roomId, username: user.username });

    newSocket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on('userTyping', ({ username }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(username);
        return newSet;
      });
    });

    newSocket.on('userStoppedTyping', ({ username }) => {
      setTypingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(username);
        return newSet;
      });
    });

    newSocket.on('roomUsers', (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.emit('leaveRoom', { roomId, username: user.username });
      newSocket.disconnect();
    };
  }, [roomId, user.username]);

  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket) return;
    
    // Emit typing event
    socket.emit('typing', { roomId, username: user.username });
    
    // Clear existing timeout
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    
    // Set a timeout to emit stopTyping
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stopTyping', { roomId, username: user.username });
    }, 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket) return;

    // Emit message to server via socket
    socket.emit('sendMessage', {
      roomId,
      senderId: user.id,
      text: newMessage.trim(),
    });

    // Stop typing immediately when sent
    socket.emit('stopTyping', { roomId, username: user.username });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    setNewMessage('');
  };

  return (
    <div
      style={{
        height: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif",
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header - Fixed at top */}
      <header
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/chat')}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              borderRadius: '8px',
              padding: '0.5rem 1rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'background 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
            onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span>←</span> Back to Rooms
          </button>
          <div>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 600, margin: 0, color: '#fff' }}>
              {roomData ? roomData.name : 'Loading Room...'}
            </h1>
            <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '0.2rem' }}>
              ● {onlineUsers.length} online {onlineUsers.length > 0 && `(${onlineUsers.join(', ')})`}
            </div>
          </div>
        </div>
        <div style={{ color: '#94a3b8', fontSize: '0.9rem' }}>
          Logged in as <strong style={{ color: '#a855f7' }}>{user?.username}</strong>
        </div>
      </header>

      {/* Chat Area - Scrollable */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '1000px',
          width: '100%',
          margin: '0 auto',
          padding: '2rem',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            flex: 1,
            background: 'rgba(0,0,0,0.2)',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.05)',
            padding: '1.5rem',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
            marginBottom: '1.5rem',
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.2) transparent',
          }}
        >
          {messages.length === 0 ? (
            <p style={{ color: '#64748b', textAlign: 'center', margin: 'auto' }}>
              No messages yet. Be the first to say hi! 👋
            </p>
          ) : (
            messages.map((msg, index) => {
              const isMine = msg.sender?._id === user.id || msg.sender === user.id;
              return (
                <div
                  key={msg._id || index}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isMine ? 'flex-end' : 'flex-start',
                  }}
                >
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '0.2rem', padding: '0 0.5rem' }}>
                    {msg.sender?.username || 'Unknown'}
                  </span>
                  <div
                    style={{
                      background: isMine
                        ? 'linear-gradient(135deg, #7c3aed, #a855f7)'
                        : 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '16px',
                      borderTopRightRadius: isMine ? '4px' : '16px',
                      borderTopLeftRadius: !isMine ? '4px' : '16px',
                      maxWidth: '70%',
                      wordBreak: 'break-word',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          
          {/* Typing Indicator */}
          {typingUsers.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '0.75rem', color: '#a855f7', padding: '0 0.5rem', fontStyle: 'italic' }}>
                {Array.from(typingUsers).join(', ')} {typingUsers.size > 1 ? 'are' : 'is'} typing...
              </span>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input - Fixed at bottom of chat area */}
        <form
          onSubmit={handleSendMessage}
          style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '1rem',
            borderRadius: '16px',
            border: '1px solid rgba(255,255,255,0.1)',
            flexShrink: 0,
          }}
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
            }}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              background: newMessage.trim() ? '#a855f7' : 'rgba(255,255,255,0.1)',
              color: newMessage.trim() ? '#fff' : '#64748b',
              border: 'none',
              borderRadius: '8px',
              padding: '0.5rem 1.5rem',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              transition: 'background 0.2s',
            }}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default Room;
