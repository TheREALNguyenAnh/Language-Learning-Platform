document.addEventListener('DOMContentLoaded', () => {
    const words = [
        { word: "Aberration", definition: "A departure from what is normal, usual, or expected" },
        { word: "Benevolent", definition: "Well meaning and kindly" },
        { word: "Capitulate", definition: "Cease to resist an opponent or an unwelcome demand" },
        { word: "Debilitate", definition: "Make someone weak and infirm" },
        { word: "Ebullient", definition: "Cheerful and full of energy" },
    ];

    let selectedWord = null;
    let selectedDefinition = null;
    let score = 0;

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
        const shuffledWords = shuffle([...words]);
        const shuffledDefinitions = shuffle([...words]);

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

            const match = words.find(item => item.word === wordText && item.definition === definitionText);

            if (match) {
                selectedWord.classList.add('correct');
                selectedDefinition.classList.add('correct');
                score++;
                document.getElementById('score').textContent = `Score: ${score}`;
            } else {
                selectedWord.classList.add('incorrect');
                selectedDefinition.classList.add('incorrect');
            }

            setTimeout(resetSelection, 1000);
        }
    }

    function resetSelection() {
        if (selectedWord) selectedWord.classList.remove('selected', 'correct', 'incorrect');
        if (selectedDefinition) selectedDefinition.classList.remove('selected', 'correct', 'incorrect');
        selectedWord = null;
        selectedDefinition = null;
    }

    initializeGame();
});
