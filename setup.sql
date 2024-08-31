CREATE DATABASE language_learning_platform;
\c language_learning_platform
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    flash_card_correct_guesses INTEGER DEFAULT 0,
    flash_card_incorrect_guesses INTEGER DEFAULT 0
);

