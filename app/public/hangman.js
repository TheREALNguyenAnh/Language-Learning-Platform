const wordDisplay = document.querySelector(".word-display");
const guessesText = document.querySelector(".guesses-text b");
const keyboardDiv = document.querySelector(".keyboard");
const hangmanImage = document.querySelector(".hangman-box img");
const gameModal = document.querySelector(".game-modal");
const playAgainBtn = gameModal.querySelector("button");
const wordList = [
    { word: "apple" },
    { word: "banana" },
    { word: "orange" },
    { word: "grape" },
    { word: "lemon" },
    { word: "pear" },
    { word: "peach" },
    { word: "melon" },
    { word: "berry" },
    { word: "plum" },
    { word: "kiwi" },
    { word: "mango" },
    { word: "bread" },
    { word: "water" },
    { word: "juice" },
    { word: "honey" },
    { word: "pizza" },
    { word: "sugar" },
    { word: "salad" },
    { word: "sauce" },
    { word: "carrot" },
    { word: "onion" },
    { word: "pepper" },
    { word: "tomato" },
    { word: "candy" },
    { word: "cookie" },
    { word: "cheese" },
    { word: "bread" },
    { word: "pasta" },
    { word: "fruit" },
];

let currentWord, correctLetters, wrongGuessCount;
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
    const userId = getUserId();
    const response = await fetch('/start-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
    });
    const { gameId, word, maxGuesses: max } = await response.json();

    currentWord = word;
    resetGame();
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
        return data.userId; 
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
        await fetch('/update-progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, isVictory })
        });
    } else {
        console.error('User ID could not be retrieved.');
    }
};

const initGame = async (button, clickedLetter) => {
    const response = await fetch('/guess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: currentWord.gameId, letter: clickedLetter })
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
