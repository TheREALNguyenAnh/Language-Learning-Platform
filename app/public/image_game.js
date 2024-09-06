const fetchPhoto = async (searchTerm) => {
    try {
        const response = await fetch(`/fetch-photo?searchTerm=${searchTerm}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
            
        if (response.ok && data.photoUrl) {
            return data.photoUrl;   
        } else {
            console.log('No photos found or an error occurred');
        }
    } catch (error) {
        console.error('Error fetching photo:', error);
    }
};

async function getUserID() {
    try {
        const response = await fetch('/user-data', {
            method: 'GET',
            credentials: 'include',
        });
        if(!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { username } = await response.json();

        const response2 = await fetch('/userid', {
            method: 'POST',
            body: JSON.stringify({username: username}),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        const { userid } = await response2.json();
        if(!response2.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        return userid;
    } catch (error) {
        console.error(error.message);
        return null;
    }
};

let correctAnswer = '';

async function loadArt() {
    const [firstResponse, secondResponse, thirdResponse, fourthResponse] = await Promise.all([
        fetch('/random-word'),
        fetch('/random-word'),
        fetch('/random-word'),
        fetch('/random-word')
    ]);

    // Parse responses as text
    const firstAnswer = await firstResponse.text();
    const sndAnswer = await secondResponse.text();
    const thirdAnswer = await thirdResponse.text();
    const fourthAnswer = await fourthResponse.text();

    correctAnswer = firstAnswer;

    // Set the correct answer and image
    document.getElementById('artImage').src = await fetchPhoto(correctAnswer);

    // Collect all choices
    const choices = [firstAnswer, sndAnswer, thirdAnswer, fourthAnswer];
    shuffleArray(choices);

    // Display choices on buttons
    document.querySelectorAll('.choices button').forEach((button, index) => {
        button.textContent = choices[index];
    });
} 

async function checkAnswer(button) {
    const userId = await getUserID();
    const isVictory = button.textContent === correctAnswer;
    if (isVictory) {
        alert('Correct!');
        loadArt();
    } else {
        alert('Wrong! Try again.');
    }
    await fetch('/update-imagegame-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            userId: userId,
            isVictory: isVictory
        })
    });
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

loadArt();