const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const dbPath = path.resolve(__dirname, 'countit.db');
const db = new sqlite3.Database(dbPath);
const PORT = 3001;
const JWT_SECRET = 'change-this-secret-in-production-env';

app.use(cors());
app.use(express.json());

// Initialize Database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS counters (
    id TEXT PRIMARY KEY,
    user_id INTEGER,
    title TEXT,
    category TEXT,
    count INTEGER,
    trackTime INTEGER,
    history TEXT,
    color TEXT,
    createdAt INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  )`);
});

// Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- Auth Routes ---

app.post('/api/auth/register', (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  const hashedPassword = bcrypt.hashSync(password, 8);
  
  db.run(`INSERT INTO users (username, email, password) VALUES (?, ?, ?)`, 
    [username, email, hashedPassword], 
    function(err) {
      if (err) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      const token = jwt.sign({ id: this.lastID, username }, JWT_SECRET, { expiresIn: '7d' });
      res.json({ token, user: { id: this.lastID, username, email } });
    }
  );
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  
  db.get(`SELECT * FROM users WHERE username = ?`, [username], (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!user) return res.status(400).json({ error: 'User not found' });
    
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(403).json({ error: 'Invalid password' });
    }

    const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, username: user.username, email: user.email } });
  });
});

// --- Counter Routes ---

app.get('/api/counters', authenticateToken, (req, res) => {
  db.all(`SELECT * FROM counters WHERE user_id = ?`, [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Parse the stored JSON history and boolean types
    const counters = rows.map(r => ({
      ...r,
      trackTime: r.trackTime === 1,
      history: JSON.parse(r.history || '[]')
    }));
    res.json(counters);
  });
});

// Sync: Replace client state into server (Simple approach for MVP)
// Ideally, you would have granular CRUD, but sync-all is safer for simple migration.
app.post('/api/counters/sync', authenticateToken, (req, res) => {
  const counters = req.body; // Expects Array<Counter>
  const userId = req.user.id;

  db.serialize(() => {
    db.run('BEGIN TRANSACTION');

    // 1. Prepare Upsert Statement
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO counters (id, user_id, title, category, count, trackTime, history, color, createdAt) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    counters.forEach(c => {
      stmt.run(
        c.id, 
        userId, 
        c.title, 
        c.category, 
        c.count, 
        c.trackTime ? 1 : 0, 
        JSON.stringify(c.history), 
        c.color, 
        c.createdAt
      );
    });
    stmt.finalize();

    // 2. Delete counters not present in the payload (Handle deletions)
    if (counters.length > 0) {
      const ids = counters.map(c => `'${c.id}'`).join(',');
      db.run(`DELETE FROM counters WHERE user_id = ? AND id NOT IN (${ids})`, [userId]);
    } else {
      // If client sends empty list, user deleted everything.
      db.run(`DELETE FROM counters WHERE user_id = ?`, [userId]);
    }

    db.run('COMMIT', (err) => {
      if (err) {
        console.error("Sync commit failed", err);
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true, count: counters.length });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});