require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/api/items', (req, res) => {
  const rows = db.prepare('SELECT id, title, content, created_at FROM items ORDER BY id DESC').all();
  res.json(rows);
});

app.get('/api/items/:id', (req, res) => {
  const row = db.prepare('SELECT id, title, content, created_at FROM items WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

app.post('/api/items', (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) return res.status(400).json({ error: 'Missing fields' });
  const stmt = db.prepare('INSERT INTO items (title, content) VALUES (?, ?)');
  const info = stmt.run(title, content);
  const created = db.prepare('SELECT id, title, content, created_at FROM items WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(created);
});

app.put('/api/items/:id', (req, res) => {
  const { title, content } = req.body;
  const id = req.params.id;
  const stmt = db.prepare('UPDATE items SET title = ?, content = ? WHERE id = ?');
  const info = stmt.run(title, content, id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  const updated = db.prepare('SELECT id, title, content, created_at FROM items WHERE id = ?').get(id);
  res.json(updated);
});

app.delete('/api/items/:id', (req, res) => {
  const info = db.prepare('DELETE FROM items WHERE id = ?').run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Not found' });
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on http://localhost:${PORT}`));
