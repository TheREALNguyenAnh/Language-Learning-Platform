CREATE DATABASE language_learning_platform;
\c language_learning_platform
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);
CREATE TABLE flashcard_sets (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE flashcards (
    id SERIAL PRIMARY KEY,
    flashcard_set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
    term VARCHAR(100) NOT NULL,
    definition TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE flashcard_edits (
    id SERIAL PRIMARY KEY,
    flashcard_id INTEGER REFERENCES flashcards(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    previous_term VARCHAR(100),
    previous_definition TEXT,
    edited_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE hangman_progress (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    games_played INTEGER DEFAULT 0,
    games_won INTEGER DEFAULT 0,
    games_lost INTEGER DEFAULT 0,
    last_game TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

