CREATE DATABASE dragonlingo;
\c dragonlingo
CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	username VARCHAR(50) UNIQUE NOT NULL,
	password VARCHAR(255) NOT NULL
);
