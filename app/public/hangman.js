const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = gameModal.querySelector("button");


let currentWord, correctLetters, wrongGuessCount, gameId;
const maxGuesses = 6;

const resetGame = () => {
    correctLetters = [];
    wrongGuessCount = 0;
    hangmanImage.src = "images/hangman-0.svg";
    guessesText.textContent = `${wrongGuessCount} / ${maxGuesses}`;

    while (wordDisplay.firstChild) {
        wordDisplay.removeChild(wordDisplay.firstChild);
    }

    currentWord.split("").forEach(() => {
        const letterElement = document.createElement("li");
        letterElement.className = "letter";
        wordDisplay.appendChild(letterElement);
    });

    keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
    gameModal.classList.remove("show");
};

const getRandomWord = async () => {
    try {
        const userId = await getUserId();
        const response = await fetch('/start-hangman', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const { gameId: newGameId, word } = await response.json();
        gameId = newGameId;
        currentWord = word;
        resetGame();
    } catch (error) {
        console.error('Error starting game:', error);
    }
};

const getUserId = async () => {
    try {
        const response = await fetch('/user-data', {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data.username; 
    } catch (error) {
        console.error('Error fetching user ID:', error);
    }
};


const gameOver = async (isVictory) => {
    let modalText;
    let imgSrc;
    let headingText;

    if (isVictory) {
        modalText = "You found the word:";
        imgSrc = "images/victory.gif";
        headingText = "Congrats!";
    } else {
        modalText = "The correct word was:";
        imgSrc = "images/lost.gif";
        headingText = "Game Over!";
    }

    gameModal.querySelector("img").src = imgSrc;
    gameModal.querySelector("h4").textContent = headingText;
    gameModal.querySelector("p").textContent = `${modalText} ${currentWord}`;
    gameModal.classList.add("show");

    const userId = await getUserId();

    if (userId) {
        await fetch('/update-hangman-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isVictory })
        });
    } else {
        console.error('User ID could not be retrieved.');
    }
};

const initGame = async (button, clickedLetter) => {
    const response = await fetch('/guess-hangman', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, letter: clickedLetter })
    });

    const { game } = await response.json();

    if (game.word.includes(clickedLetter)) {
        [...game.word].forEach((letter, index) => {
            if (letter === clickedLetter) {
                correctLetters.push(letter);
                const letterElement = wordDisplay.querySelectorAll("li")[index];
                letterElement.textContent = letter;
                letterElement.classList.add("guessed");
            }
        });
    } else {
        wrongGuessCount = game.wrongGuessCount;
        hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
    }

    button.disabled = true;
    guessesText.textContent = `${wrongGuessCount} / ${maxGuesses}`;

    if (game.status === 'lost') return gameOver(false);
    if (game.status === 'won') return gameOver(true);
};

for (let i = 97; i <= 122; i++) {
    const button = document.createElement("button");
    button.textContent = String.fromCharCode(i);
    keyboardDiv.appendChild(button);
    button.addEventListener("click", (e) => initGame(e.target, String.fromCharCode(i)));
}

getRandomWord();
playAgainBtn.addEventListener("click", getRandomWord);
