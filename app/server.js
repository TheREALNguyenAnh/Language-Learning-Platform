const keys = require("./keys.json");
const apiKey = keys["dictionary"];
const words = require("./sample-words.json");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
let cookieParser = require("cookie-parser");
const app = express();
const path = require('path');
const axios = require("axios");
const PORT = 3000;
let { Pool } = require("pg");
process.chdir(__dirname);
let host;
let dbConf;
if (process.env.NODE_ENV == 'production') {
  console.log("NODE_ENV = production");
  host = '0.0.0.0';
  dbConf = { connectionString: process.env.DATABASE_URL };
}
else {
  host = 'localhost';
  let { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT } = process.env;
  dbConf = { PGUSER, PGPASSWORD, PGDATABASE, PGHOST, PGPORT };
}

let pool = new Pool(dbConf);
const secretKey = keys.authenticationKey; 

pool.connect().then(function () {
  console.log(`Connected to database`);
});

let cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.get('/random-word', (req, res) => {
  let index = Math.floor(Math.random() * words.length);
  res.set('Content-Type', 'text/plain');
  res.send(words[index]);
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

app.post('/signup', async (req, res) => {

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
    console.log(error);
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

app.post('/userid', async (req, res) => {
  const { username } = req.body;
  try {
    const useridquery = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
    res.json({ userid: useridquery.rows[0].id });
  } catch (error) {
    console.error(error);
    res.status(500).send(error.toString());
  }
});

app.post('/insert-quiz', async (req, res) => {
  const { userid, successes, attempts } = req.body;
  let insertquizquery = await pool.query('INSERT INTO quiz (user_id, successes, attempts) VALUES ($1, $2, $3)', [userid, successes, attempts]);
  console.log(insertquizquery);
  res.end();
});

app.get('/mwd/:word', (req, res) => {
  let url = `https://dictionaryapi.com/api/v3/references/collegiate/json/${req.params.word}?key=${keys.dictionary}`;
  axios(url).then(response => {
    let word = req.params.word;
    let shortdef = response.data[0].shortdef[0];
    let audio = response.data[0].hwi.prs[0].sound.audio;
    let regex = '/^\d/';
    let subdirectory;
    if(audio.startsWith('bix')) {
      subdirectory = 'bix';
    }
    else if(audio.startsWith('gg')) {
      subdirectory = 'gg';
    }
    else if(/^\d|\p{P}/u.test(audio)) {
      subdirectory = 'number';
    }
    else {
      subdirectory = audio[0];
    }
    let audiourl = `https://media.merriam-webster.com/audio/prons/en/us/mp3/${subdirectory}/${audio}.mp3`;
    res.json({'shortdef': shortdef, 'audiourl': audiourl});
  }).catch(error => {
    console.log(error);
  })
});

app.post('/translate', (req, res) => {
  const reqBody = req.body;
  let reqUrl = `https://translation.googleapis.com/language/translate/v2?key=${keys.translate}`;
  axios({
    method: 'post',
    url: reqUrl,
    headers: {
      'Content-Type': 'application/json; charset=utf-8'
    },
    data: reqBody
  }).then(response => {
    res.send(response.data);
  }).catch(error => {
    console.log(error);
  });
});

app.get('/fetch-photo', async (req, res) => {
  const { searchTerm } = req.query; 

  if (!searchTerm) {
      return res.status(400).json({ error: 'Search term is required' });
  }

  try {
      const photoUrl = `https://api.unsplash.com/search/photos?query=${searchTerm}&client_id=${keys.images}`;
      const response = await fetch(photoUrl);
      if (!response.ok) {
          throw new Error(`Unsplash API error: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.results.length > 0) {
          const imageUrl = data.results[0].urls.regular;
          res.json({ photoUrl: imageUrl });
      } else {
          res.status(404).json({ error: 'No photos found' });
      }
  } catch (error) {
      console.error('Error fetching photo:', error);
      res.status(500).json({ error: 'Failed to fetch photo' });
  }
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

let games = {};

app.post('/start-hangman', (req, res) => {
    const { userId } = req.body;
    const word = getRandomWord();
    const gameId = Date.now(); 

    games[gameId] = {
        userId,
        word,
        correctLetters: [],
        wrongGuessCount: 0,
        maxGuesses: 6,
        status: 'in_progress'
    };

    res.json({ gameId, word });
});

app.post('/update-hangman-progress', async (req, res) => {
  const { userId, isVictory } = req.body;
  try {
      const result = await pool.query(
          `UPDATE hangman_progress
          SET games_played = games_played + 1,
              ${isVictory ? 'games_won = games_won + 1' : 'games_lost = games_lost + 1'},
              last_game = CURRENT_TIMESTAMP
          WHERE username = $1
          RETURNING *`,
          [userId]
      );
      
      if (result.rowCount === 0) {
          // If no progress record exists for the user, create one
          await pool.query(
              `INSERT INTO hangman_progress (username, games_played, games_won, games_lost)
               VALUES ($1, 1, $2, $3)`,
              [userId, isVictory ? 1 : 0, isVictory ? 0 : 1]
          );
      }

      res.json({ message: 'Progress updated successfully!' });
  } catch (err) {
      console.error(err.message);
      res.status(500).send('Server error');
  }
});

app.post('/guess-hangman', (req, res) => {
    const { gameId, letter } = req.body;
    const game = games[gameId];

    if (!game || game.status !== 'in_progress') {
        return res.status(404).send('Game not found or already finished.');
    }

    if (game.word.includes(letter)) {
        [...game.word].forEach((l, index) => {
            if (l === letter && !game.correctLetters.includes(l)) {
                game.correctLetters.push(l);
            }
        });
    } else {
        game.wrongGuessCount++;
    }

    if (game.wrongGuessCount >= game.maxGuesses) {
        game.status = 'lost';
    } else if (game.correctLetters.length === game.word.length) {
        game.status = 'won';
    }

    res.json({ game });
});

app.get('/hangman-progress/:gameId', (req, res) => {
    const { gameId } = req.params;
    const game = games[gameId];
    
    if (!game) {
        return res.status(404).send('Game not found.');
    }

    res.json({ game });
});


app.post('/update-imagegame-progress', async (req, res) => {
const { userId, isVictory } = req.body;
try {
    const result = await pool.query(
        `UPDATE imagegame_progress
        SET games_played = games_played + 1,
            ${isVictory ? 'games_won = games_won + 1' : 'games_lost = games_lost + 1'},
            last_game = CURRENT_TIMESTAMP
        WHERE username = $1
        RETURNING *`,
        [userId]
    );
    
    if (result.rowCount === 0) {
        // If no progress record exists for the user, create one
        await pool.query(
            `INSERT INTO imagegame_progress (username, games_played, games_won, games_lost)
             VALUES ($1, 1, $2, $3)`,
            [userId, isVictory ? 1 : 0, isVictory ? 0 : 1]
        );
    }

    res.json({ message: 'Progress updated successfully!' });
} catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
}
});

const getRandomWord = () => {
  const words = ['apple', 'banana', 'orange', 'grape', 'lemon'];
  return words[Math.floor(Math.random() * words.length)];
};

app.post('/log-performance', isAuthenticated, async (req, res) => {
  const { correctGuesses, incorrectGuesses } = req.body;
  const userId = req.user.id; // Extract user ID from the decoded JWT

  try {
      const query = `
          UPDATE users 
          SET flash_card_correct_guesses = flash_card_correct_guesses + $1, 
              flash_card_incorrect_guesses = flash_card_incorrect_guesses + $2 
          WHERE id = $3
      `;
      await pool.query(query, [correctGuesses, incorrectGuesses, userId]);
      res.status(200).json({ message: 'Performance logged successfully' });
  } catch (error) {
      console.error('Error logging performance:', error);
      res.status(500).json({ message: 'Failed to log performance' });
  }
});

app.get('/performance-stats', isAuthenticated, async (req, res) => {
  try {
      const userId = req.user.id;
      const result = await pool.query('SELECT flash_card_correct_guesses, flash_card_incorrect_guesses FROM users WHERE id = $1', [userId]);

      if (result.rows.length > 0) {
          const { flash_card_correct_guesses, flash_card_incorrect_guesses } = result.rows[0];
          res.json({ correctMatches: flash_card_correct_guesses, incorrectMatches: flash_card_incorrect_guesses });
      } else {
          res.status(404).json({ message: 'User not found' });
      }
  } catch (error) {
      console.error('Error fetching performance stats:', error);
      res.status(500).json({ message: 'Server error' });
  }
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

app.get('/hangman', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'hangman.html'));
});

app.get('/imageGame', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'image_game.html'));
});

app.get('/homeES', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homeES.html'));
});
app.get('/homeFR', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homeFR.html'));
});
app.get('/homeDE', isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'homeDE.html'));
});

app.listen(PORT, host, () => {
  console.log(`Server is running on http://${host}:${PORT}`);
});