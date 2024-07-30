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

app.post('/auth', (req, res) => {
  const { username, password } = req.body;
  // Here you would check the database for user credentials and handle login/signup logic.
  // For now, we'll just send a success message.
  res.status(200);
  res.json({ message: `User ${username} logged in/sign up successfully!` });
  console.log(`User ${username} logged in/sign up successfully!`);
});
