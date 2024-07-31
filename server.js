const pg = require("pg");
const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const env = require("./env.json");
const Pool = pg.Pool;
const pool = new Pool(env);
pool.connect().then(function () {
  console.log(`Connected to database ${env.database}`);
});

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]).then(result => {
    if (result.rows.length > 0) {
      res.status(200).send({ message: 'Login successful' });
    } else {
      res.status(400).send({ message: 'Invalid username or password' });
    }
  }).catch(error => {
    console.error('Database error:', error);
    res.status(500).send({ message: 'Database error' });
  });
});

app.post('/signup', (req, res) => {

  const { username, password } = req.body;
  pool.query('SELECT 1 FROM users WHERE username = $1', [username]).then(userExistsResult => {
    if (userExistsResult.rows.length > 0) {
      return res.status(400).send({ message: 'Username already exists' });
    }

    // Insert the new user
    return pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, password]);
  }).then(() => {
    res.status(200).send({ message: 'User signed up successfully' });
  }).catch(error => {
    console.error('Database error:', error);
    res.status(500).send({ message: 'Database error' });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});