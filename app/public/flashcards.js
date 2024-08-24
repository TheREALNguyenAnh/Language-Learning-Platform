document.addEventListener('DOMContentLoaded', async () => {
    const wordList = [];

    // Function to fetch a random word
    async function getRandomWord() {
        const response = await fetch('/random-word');
        const word = await response.text();
        return word;
    }

    // Function to fetch the definition and audio URL for a word
    async function getWordDetails(word) {
        const response = await fetch(`/mwd/${word}`);
        const data = await response.json();
        return {
            word: word,
            definition: data.shortdef,
            audiourl: data.audiourl
        };
    }

    // Fetch 6 random words and their details
    async function loadFlashcards() {
        for (let i = 0; i < 6; i++) {
            const word = await getRandomWord();
            const details = await getWordDetails(word);
            wordList.push(details);
        }
        initializeGame();
    }

    let selectedWord = null;
    let selectedDefinition = null;
    let correctGuesses = 0;
    let incorrectGuesses = 0;

    function shuffle(array) {
        return array.sort(() => Math.random() - 0.5);
    }

    function createFlashcard(content, containerId, clickHandler) {
        const container = document.getElementById(containerId);
        const flashcard = document.createElement('div');
        flashcard.classList.add('flashcard');
        flashcard.textContent = content;
        flashcard.addEventListener('click', clickHandler);
        container.appendChild(flashcard);
    }

    function initializeGame() {
        const shuffledWords = shuffle([...wordList]);
        const shuffledDefinitions = shuffle([...wordList]);

        shuffledWords.forEach(item => createFlashcard(item.word, 'word-container', handleWordClick));
        shuffledDefinitions.forEach(item => createFlashcard(item.definition, 'definition-container', handleDefinitionClick));
    }

    function handleWordClick(event) {
        const selectedElement = event.target;
        if (selectedWord) selectedWord.classList.remove('selected');
        selectedWord = selectedElement;
        selectedWord.classList.add('selected');

        checkMatch();
    }

    function handleDefinitionClick(event) {
        const selectedElement = event.target;
        if (selectedDefinition) selectedDefinition.classList.remove('selected');
        selectedDefinition = selectedElement;
        selectedDefinition.classList.add('selected');

        checkMatch();
    }

    function checkMatch() {
        if (selectedWord && selectedDefinition) {
            const wordText = selectedWord.textContent;
            const definitionText = selectedDefinition.textContent;

            const match = wordList.find(item => item.word === wordText && item.definition === definitionText);

            if (match) {
                selectedWord.classList.add('correct');
                selectedDefinition.classList.add('correct');
                correctGuesses++;
                document.getElementById('score').textContent = `Correct: ${correctGuesses} | Incorrect: ${incorrectGuesses}`;
                
                setTimeout(() => {
                    selectedWord.remove();
                    selectedDefinition.remove();
                    resetSelection();
                }, 500);
            } else {
                selectedWord.classList.add('incorrect');
                selectedDefinition.classList.add('incorrect');
                incorrectGuesses++;
                document.getElementById('score').textContent = `Correct: ${correctGuesses} | Incorrect: ${incorrectGuesses}`;
                
                setTimeout(resetSelection, 1000);
            }
        }
    }

    function resetSelection() {
        if (selectedWord) selectedWord.classList.remove('selected', 'correct', 'incorrect');
        if (selectedDefinition) selectedDefinition.classList.remove('selected', 'correct', 'incorrect');
        selectedWord = null;
        selectedDefinition = null;
    }

    // Load the flashcards when the game starts
    loadFlashcards();
});
