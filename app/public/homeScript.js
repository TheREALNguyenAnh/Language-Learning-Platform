// public/homeScript.js
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const userResponse = await fetch('/user-data', {
            method: 'GET',
            credentials: 'include',
        });
        if (userResponse.ok) {
            const { username } = await userResponse.json();
            document.getElementById('welcomeMessage').textContent = `Welcome, ${username}`;
        } else {
            console.error('Failed to fetch user data');
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
    }

    try {
        const performanceResponse = await fetch('/performance-stats');
        if (performanceResponse.ok) {
            const { correctMatches, incorrectMatches } = await performanceResponse.json();

            document.getElementById('correctMatches').textContent = correctMatches;
            document.getElementById('incorrectMatches').textContent = incorrectMatches;
        } else {
            console.error('Failed to fetch performance stats');
        }
    } catch (error) {
        console.error('Error fetching performance stats:', error);
    }

    try {
        const response = await fetch('/user-data', {
            method: 'GET',
            credentials: 'include',
        });
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { username } = await response.json();

        const response2 = await fetch('/userid', {
            method: 'POST',
            body: JSON.stringify({ username: username }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response2.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { userid } = await response2.json();

        const response3 = await fetch('/get-quizzes', {
            method: 'POST',
            body: JSON.stringify({ userid: userid }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response3.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { rowCount } = await response3.json();
        console.log(rowCount);
        let quizzestaken = document.getElementById('quizzes-taken');
        quizzestaken.textContent = rowCount;

        const response4 = await fetch('/get-quiz-performance', {
            method: 'POST',
            body: JSON.stringify({ userid: userid }),
            headers: {
                'Content-Type': 'application/json'
            },
        });
        if (!response4.ok) {
            throw new Error(`Response status: ${response.status}`)
        }
        const { successes, attempts } = await response4.json();
        let quizpercentage = document.getElementById('quiz-percentage');
        if (successes && attempts)
            quizpercentage.textContent = (successes / parseFloat(attempts) * 100).toFixed(2) + '\%';
        else
            quizpercentage.textContent = 'No quizzes taken yet !';
    } catch (error) {
        console.error(error.message);
    }
});

document.getElementById('logoutButton').addEventListener('click', async () => {
    const logoutResponse = await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
    });

    if (logoutResponse.ok) {
        window.location.href = '/';
    } else {
        console.error('Logout failed');
    }
});

document.getElementById('gameButton').addEventListener('click', function () {
    window.location.href = '/flashcards-game';
});

document.getElementById('hangman').addEventListener('click', function () {
    window.location.href = '/hangman';
});

document.getElementById('imageGame').addEventListener('click', function () {
    window.location.href = '/imageGame';
});