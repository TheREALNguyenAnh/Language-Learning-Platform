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

let correctAnswer = '';

async function loadArt() {
    const response = await fetch('/get-art');
    const data = await response.json();
    
    correctAnswer = data.artid;
    //document.getElementById('artImage').src = `https://www.merriam-webster.com/assets/mw/static/art/dict/${data.artid}.gif`;
    document.getElementById('artImage').src = await fetchPhoto(data.artid);

    // Example choices for now
    const choices = ["cow", "bird", "dog", "horse"];
    shuffleArray(choices);
    document.querySelectorAll('.choices button').forEach((button, index) => {
        button.textContent = choices[index];
    });
} 

async function checkAnswer(button) {
    const userId = await getUserId();
    const isVictory = button.textContent === correctAnswer;
    if (button.textContent === correctAnswer) {
        alert('Correct!');
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
    loadArt();
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

loadArt();