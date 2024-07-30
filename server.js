const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  // Here you would typically check the database for user credentials and handle login/signup logic.
  // For now, we'll just send a success message.
  res.json({ message: `User ${username} logged in successfully!` });
});

app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  // Here you would typically create a new user in the database.
  // For now, we'll just send a success message.
  res.json({ message: `User ${username} signed up successfully!` });
});