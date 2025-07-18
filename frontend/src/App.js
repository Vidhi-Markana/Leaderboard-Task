import React, { useEffect, useState, useRef } from 'react';
import './App.css';
import Pagination from './components/Pagination';

const API_URL = 'http://localhost:4000';

function getInitials(name) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
}

const crowns = [
  <span className="crown gold" key="gold" role="img" aria-label="gold crown">👑</span>,
  <span className="crown silver" key="silver" role="img" aria-label="silver crown">👑</span>,
  <span className="crown bronze" key="bronze" role="img" aria-label="bronze crown">👑</span>,
];

const medals = [
  <span className="podium-medal" key="gold" role="img" aria-label="gold medal">🥇</span>,
  <span className="podium-medal" key="silver" role="img" aria-label="silver medal">🥈</span>,
  <span className="podium-medal" key="bronze" role="img" aria-label="bronze medal">🥉</span>,
];

function formatTime(ts) {
  const d = new Date(ts);
  return d.toLocaleString();
}

// ClaimHistory component for paginated claim history
function ClaimHistory({ history, page, pageSize, onPageChange }) {
  const totalPages = Math.ceil(history.length / pageSize);
  const paginated = history.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="claim-history">
      <h4 style={{textAlign:'center', color:'#bfa100', margin:'0 0 8px 0', fontWeight:700, fontSize:'1.08rem'}}>Claim History</h4>
      <div style={{maxHeight: 120, overflowY: 'auto', fontSize: '0.95rem', background:'#fffbe6', borderRadius:8, padding:'8px 10px'}}>
        {paginated.length === 0 && <div style={{textAlign:'center', color:'#bfa100'}}>No claims yet.</div>}
        {paginated.map((h, i) => (
          <div key={i} style={{display:'flex',alignItems:'center',marginBottom:3}}>
            <span style={{fontWeight:700, color:'#bfa100', marginRight:6}}>{getInitials(h.name)}</span>
            <span style={{flex:1}}>{h.name}</span>
            <span style={{marginRight:8, color:'#3b3b5c'}}>+{h.points}</span>
            <span style={{color:'#bfa100', fontSize:'0.92em'}}>{formatTime(h.timestamp)}</span>
          </div>
        ))}
      </div>
      <Pagination currentPage={page} totalPages={totalPages} onPageChange={onPageChange} />
    </div>
  );
}

function App() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [toggle, setToggle] = useState('Monthly');
  const [newUser, setNewUser] = useState('');
  const [history, setHistory] = useState([]);
  const prevFirstId = useRef(null);
  const [rowAnimations, setRowAnimations] = useState({});
  const prevOrder = useRef([]);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const toastTimeout = useRef(null);
  // Pagination state for claim history
  const [historyPage, setHistoryPage] = useState(1);
  const pageSize = 7;
  // Animation state for podium
  const [podiumAnims, setPodiumAnims] = useState([false, false, false]);
  const prevPodium = useRef([null, null, null]);

  const fetchUsers = async () => {
    const res = await fetch(`${API_URL}/users`);
    const data = await res.json();
    // Animation logic: compare previous and new order
    if (prevOrder.current.length > 0) {
      const newOrder = data.map(u => u._id);
      const anims = {};
      newOrder.forEach((id, idx) => {
        const prevIdx = prevOrder.current.indexOf(id);
        if (prevIdx !== -1 && prevIdx !== idx) {
          anims[id] = true;
        }
      });
      setRowAnimations(anims);
      setTimeout(() => setRowAnimations({}), 600);
    }
    prevOrder.current = data.map(u => u._id);
    setUsers(data);
  };

  const fetchHistory = async () => {
    const res = await fetch(`${API_URL}/history`);
    const data = await res.json();
    setHistory(data);
  };

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, []);

  // When history changes, reset to first page if needed
  useEffect(() => {
    setHistoryPage(1);
  }, [history]);

  // Animation logic for leaderboard rows (already present)

  // Animation logic for podium
  useEffect(() => {
    const newPodium = [users[1]?._id, users[0]?._id, users[2]?._id];
    const anims = [false, false, false];
    for (let i = 0; i < 3; i++) {
      if (newPodium[i] && prevPodium.current[i] !== newPodium[i]) {
        anims[i] = true;
      }
    }
    setPodiumAnims(anims);
    prevPodium.current = newPodium;
    if (anims.some(Boolean)) {
      setTimeout(() => setPodiumAnims([false, false, false]), 900);
    }
  }, [users]);

  const handleSelect = (e) => {
    setSelectedUser(e.target.value);
  };

  const handleClaim = async () => {
    if (!selectedUser) return;
    setLoading(true);
    setMessage('');
    const res = await fetch(`${API_URL}/users/${selectedUser}/claim`, { method: 'POST' });
    const data = await res.json();
    setToast(`Claimed ${data.claimed} points for ${data.name} (Total: ${data.points})`);
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    toastTimeout.current = setTimeout(() => setToast(''), 3000);
    await fetchUsers();
    await fetchHistory();
    setLoading(false);
  };

  const handleAddUser = async () => {
    if (!newUser.trim()) return;
    setError('');
    const res = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newUser })
    });
    if (res.ok) {
      setNewUser('');
      setToast('User added successfully!');
      if (toastTimeout.current) clearTimeout(toastTimeout.current);
      toastTimeout.current = setTimeout(() => setToast(''), 3000);
      await fetchUsers();
    } else {
      const data = await res.json();
      if (data.error && data.error.toLowerCase().includes('exists')) {
        setError('Username already exists!');
      } else {
        setError('Failed to add user.');
      }
    }
  };

  // Podium: center is 1st (gold), left is 2nd (silver), right is 3rd (bronze)
  const podiumUsers = [users[1], users[0], users[2]]; // left, center, right
  const podiumRanks = [1, 0, 2]; // left: 2nd, center: 1st, right: 3rd

  return (
    <div className="app-container">
      <div className="header-banner">
        <div style={{display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center'}}>
          <span className="shield" role="img" aria-label="Leaderboard logo">🛡️⭐️</span>
          <h1 style={{margin:'10px 0 0 0', fontWeight:800, fontSize:'2.1rem', color:'#fff', letterSpacing:'1px', textShadow:'0 2px 8px #6366f1aa'}}>Leaderboard Challenge</h1>
          <p style={{fontSize:'1.13rem', color:'#ede9fe', margin:'14px 0 0 0', fontWeight:500, textAlign:'center', maxWidth:340}}>
            Compete for the top spot! Claim points for your favorite user and watch the leaderboard update in real time.
          </p>
        </div>
      </div>
      {/* Toast Notification */}
      {toast && <div className="toast-notification">{toast}</div>}
      {/* Add User Bar */}
      <div className="select-claim-bar" style={{ marginBottom: 0, marginTop: 32, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <input
          className="select-user"
          style={{ width: 180, marginRight: 16 }}
          type="text"
          placeholder="Enter name"
          value={newUser}
          onChange={e => setNewUser(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') handleAddUser(); }}
        />
        <button
          className="claim-btn"
          style={{ background: 'linear-gradient(90deg,#ffd700 0%,#ffb347 100%)', color: '#fff', minWidth: 120 }}
          onClick={handleAddUser}
        >
          Add User
        </button>
      </div>
      {/* Error Message for Add User */}
      {error && <div className="error-message" style={{margin:'16px 0',padding:'10px',background:'#ffe0e0',borderRadius:12,color:'#b71c1c',fontWeight:600,textAlign:'center',boxShadow:'0 1px 4px #ffb2b2'}}>{error}</div>}
      {/* Podium */}
      <div className="podium" style={{ marginTop: 36 }}>
        {/* Left: 2nd place (silver) */}
        <div className={`podium-card silver${podiumAnims[0] ? ' animated' : ''}`}>
          {crowns[1]}
          <div className="podium-avatar">{users[1] && getInitials(users[1].name)}</div>
          <div className="podium-name">{users[1] && users[1].name}</div>
          <div className="podium-points">{users[1] && users[1].points}{users[1] && medals[1]}</div>
        </div>
        {/* Center: 1st place (gold) */}
        <div className={`podium-card gold${podiumAnims[1] ? ' animated' : ''}`}>
          {crowns[0]}
          <div className="podium-avatar">{users[0] && getInitials(users[0].name)}</div>
          <div className="podium-name">{users[0] && users[0].name}</div>
          <div className="podium-points">{users[0] && users[0].points}{users[0] && medals[0]}</div>
        </div>
        {/* Right: 3rd place (bronze) */}
        <div className={`podium-card bronze${podiumAnims[2] ? ' animated' : ''}`}>
          {crowns[2]}
          <div className="podium-avatar">{users[2] && getInitials(users[2].name)}</div>
          <div className="podium-name">{users[2] && users[2].name}</div>
          <div className="podium-points">{users[2] && users[2].points}{users[2] && medals[2]}</div>
        </div>
      </div>
      {/* Select/Claim Bar */}
      <div className="select-claim-bar" style={{ marginTop: 32, marginBottom: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <select
          className="select-user"
          value={selectedUser}
          onChange={handleSelect}
          style={{ width: 180, marginRight: 16 }}
        >
          <option value="">Select a user</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.name}</option>
          ))}
        </select>
        <button
          className="claim-btn"
          onClick={handleClaim}
          disabled={!selectedUser || loading}
          style={{ minWidth: 120 }}
        >
          {loading ? 'Claiming...' : 'Claim Points'}
        </button>
      </div>
      {/* Ranking List */}
      <div className="ranking-list" style={{ marginTop: 36 }}>
        {users.slice(3).map((user, idx) => (
          <div
            className={`ranking-row${String(user._id) === String(selectedUser) ? ' selected' : ''}${rowAnimations[user._id] ? ' animated' : ''}`}
            key={user._id}
          >
            <div className="ranking-rank">{idx + 4}</div>
            <div className="ranking-avatar">{getInitials(user.name)}</div>
            <div className="ranking-name">{user.name}</div>
            <div className="ranking-points">{user.points}<span className="ranking-medal" role="img" aria-label="star">⭐</span></div>
          </div>
        ))}
      </div>
      {/* Claim History with Pagination */}
      <ClaimHistory history={history} page={historyPage} pageSize={pageSize} onPageChange={setHistoryPage} />
      <footer className="footer" aria-label="footer">Crafted with ❤️ by Vidhi Markana</footer>
    </div>
  );
}

export default App; 