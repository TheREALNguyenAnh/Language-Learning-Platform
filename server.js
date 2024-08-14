const keys = require("./keys.json");
const apiKey = keys["dictionary"];
const words = require("./sample-words.json");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
let cookieParser = require("cookie-parser");
const app = express();
const pg = require('pg');
const path = require('path');
const axios = require("axios");
const PORT = 3000;
let host;
let dbConf;
if (process.env.NODE_ENV === 'production') {
  host = '0.0.0.0';
  dbConf = { connectionString: process.env.DATABASE_URL };
}
else {
  host = 'localhost';
  let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
  dbConf = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}
const pool = new Pool(dbConf);
const secretKey = keys.authenticationKey; 

pool.connect().then(function () {
  console.log(`Connected to database}`);
});

let cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());

app.get('/sample-words', (req, res) => {
  res.send(words);
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const isMatch = await bcrypt.compare(password, user.password);

      if (isMatch) {
        const token = jwt.sign({ id: user.id, username: user.username }, secretKey, { expiresIn: '1h' });
        return res.cookie('token', token, cookieOptions).send({ message: 'Login successful' });
      }
    }
    res.status(400).send({ message: 'Invalid username or password' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ message: 'Database error' });
  }
});

app.post('/signup',async (req, res) => {

  const { username, password } = req.body;
  
  try {
    const userExistsResult = await pool.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (userExistsResult.rows.length > 0) {
      return res.status(400).send({ message: 'Username already exists' });
    }
    
    //Hashed password and insert new user
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(200).send({ message: 'User signed up successfully' });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).send({ message: 'Database error' });
  }
});

//authentication using JWT
function isAuthenticated(req, res, next) {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).send({ message: 'No Auth Token' });
  }

  jwt.verify(token, secretKey, (err, user) => {
    if (err) {
      return res.status(403).send({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  });
}


app.get('/loggedin', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'home.html'));
  console.log('Red Spy in Base');
});

app.get('/user-data', isAuthenticated, (req, res) => {
  res.json({ username: req.user.username });
});

app.post('/logout', (req, res) => {
  return res.clearCookie('token', cookieOptions).send({ message: 'Logged out successfully' });
});



app.get('/word/:word', (req, res) => {
  let url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${req.params.word}?key=${keys.dictionary}`;
  axios(url).then(response => {
    res.json(response.data);
  }).catch(error => {
    console.log(error);
  })
});


const artData = [
  { artid: "cow"},
  { artid: "horse"},
  { artid: "dog"},
  { artid: "bird"}
];

app.get('/get-art', (req, res) => {
  const randomIndex = Math.floor(Math.random() * artData.length);
  res.json(artData[randomIndex]);
});


app.listen(PORT, () => {
  console.log(`Server is running on http://${host}:${PORT}`);
});

// Create a new flashcard set
app.post('/flashcard-sets', isAuthenticated, async (req, res) => {
  // Logic to create a new flashcard set
});

// Add a flashcard to a set
app.post('/flashcard-sets/:setId/flashcards', isAuthenticated, async (req, res) => {
  // Logic to add a flashcard to a specific set
});

// Edit a flashcard
app.put('/flashcards/:id', isAuthenticated, async (req, res) => {
  // Logic to edit a flashcard
});

// Get all flashcard sets
app.get('/flashcard-sets', async (req, res) => {
  // Logic to retrieve all flashcard sets
});

app.get('/flashcards-game', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'flashcards.html'));
});