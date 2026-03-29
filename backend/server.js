const express = require('express');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');

const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

// ───── DATABASE SETUP ─────
const db = new Database('movietracker.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT    NOT NULL,
    email    TEXT    NOT NULL UNIQUE,
    password TEXT    NOT NULL
  );

  CREATE TABLE IF NOT EXISTS journal (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    movieTitle  TEXT    NOT NULL,
    dateWatched TEXT    NOT NULL,
    thoughts    TEXT    NOT NULL,
    rating      INTEGER NOT NULL
  );
`);

console.log('Database ready!');

// ───── MOVIES ─────
app.get('/api/movies', (req, res) => {
  res.json([
    { id: 1, title: 'Inception',     genre: 'Thriller', year: 2010 },
    { id: 2, title: 'The Godfather', genre: 'Drama',    year: 1972 },
    { id: 3, title: 'Anora',         genre: 'Drama',    year: 2024 },
  ]);
});

// ───── REGISTER ─────
app.post('/api/register', async (req, res) => {
  const { fullname, email, password } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Hash the password before saving (10 = how strong the hashing is)
    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = db.prepare(`
      INSERT INTO users (fullname, email, password)
      VALUES (?, ?, ?)
    `);
    const result = insert.run(fullname, email, hashedPassword);

    res.status(201).json({ message: 'Account created!', userId: result.lastInsertRowid });
  } catch (err) {
    res.status(400).json({ error: 'Email already registered' });
  }
});

// ───── LOGIN ─────
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(username);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Compare the typed password against the hashed one in the database
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  res.json({ message: 'Login successful!', userId: user.id, fullname: user.fullname });
});

// ───── JOURNAL ─────
app.get('/api/journal', (req, res) => {
  const entries = db.prepare('SELECT * FROM journal ORDER BY id DESC').all();
  res.json(entries);
});

app.post('/api/journal', (req, res) => {
  const { movieTitle, dateWatched, thoughts, rating } = req.body;

  if (!movieTitle || !dateWatched || !thoughts || !rating) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const insert = db.prepare(`
    INSERT INTO journal (movieTitle, dateWatched, thoughts, rating)
    VALUES (?, ?, ?, ?)
  `);
  const result = insert.run(movieTitle, dateWatched, thoughts, rating);

  res.status(201).json({ message: 'Entry saved!', id: result.lastInsertRowid });
});

// ───── START SERVER ─────
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});