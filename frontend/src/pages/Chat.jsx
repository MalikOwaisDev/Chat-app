import { useAuth } from '../context/AuthContext';

/**
 * Placeholder Chat dashboard (Feature 2+ will build this out fully)
 * For now shows a welcome screen confirming auth works
 */
const Chat = () => {
  const { user, logout } = useAuth();

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#e2e8f0',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <div
        style={{
          textAlign: 'center',
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '3rem',
        }}
      >
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Authentication Working!
        </h1>
        <p style={{ color: '#94a3b8', marginBottom: '1.5rem' }}>
          Welcome, <strong style={{ color: '#a78bfa' }}>{user?.username}</strong>!
          <br />
          Feature 2 (Chat Rooms) coming next.
        </p>
        <button
          id="logout-btn"
          onClick={logout}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            padding: '0.75rem 2rem',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Chat;
