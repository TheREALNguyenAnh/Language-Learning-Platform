CREATE DATABASE dragonlingo-db;
\c dragonlingo-db
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

