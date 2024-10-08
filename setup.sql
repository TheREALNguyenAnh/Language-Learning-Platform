CREATE DATABASE language_learning_platform;
\c language_learning_platform
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    flash_card_correct_guesses INTEGER DEFAULT 0,
    flash_card_incorrect_guesses INTEGER DEFAULT 0
);
CREATE TABLE quiz (
    quiz_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    word VARCHAR(50) NOT NULL,
    lang CHAR(2) NOT NULL,
    taken_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    successes INTEGER NOT NULL DEFAULT 0,
    attempts INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE hangman_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    last_game TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE imagegame_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    last_game TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);