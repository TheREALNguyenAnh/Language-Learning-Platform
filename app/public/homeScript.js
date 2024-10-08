// public/homeScript.js
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('lang-en').addEventListener('click', function () {
    onClick('en');
  });
  document.getElementById('lang-es').addEventListener('click', function () {
    onClick('es');
  });
  document.getElementById('lang-fr').addEventListener('click', function () {
    onClick('fr');
  });
  document.getElementById('lang-de').addEventListener('click', function () {
    onClick('de');
  });
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
       const performanceResponse = await fetch('/performance-hangman');
       if (performanceResponse.ok) {
        const { correctMatches, incorrectMatches } = await performanceResponse.json();

        document.getElementById('correctHangmanGuesses').textContent = correctMatches;
        document.getElementById('incorrectHangmanGuesses').textContent = incorrectMatches;
    } else {
        console.error('Failed to fetch performance stats');
    }
  } catch (error) {
      console.error('Error fetching performance stats:', error);
  }

  try {
       const performanceResponse = await fetch('/performance-picture');
       if (performanceResponse.ok) {
       const { correctMatches, incorrectMatches } = await performanceResponse.json();

        document.getElementById('correctPictureGuesses').textContent = correctMatches;
        document.getElementById('incorrectPictureGuesses').textContent = incorrectMatches;
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
    if(!response2.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const { userid } = await response2.json();

    const response3 = await fetch('/get-quiz-performance', {
        method: 'POST',
        body: JSON.stringify({userid: userid}),
        headers: {
            'Content-Type': 'application/json'
        },
    });
    if(!response3.ok) {
        throw new Error(`Response status: ${response.status}`)
    }
    const { successes, attempts } = await response3.json(); 
    let quizpercentage = document.getElementById('quiz-percentage');
    if(successes && attempts)
        quizpercentage.textContent = successes/parseFloat(attempts) * 100 + '\%';
    else
    quizpercentage.textContent = 'No quizzes taken yet !';
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

function onClick(lang) {
    fetch('/set-lang', {
        method: 'POST',
        body: JSON.stringify({'lang': lang}),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        location.reload();
    }).catch(error => {
        console.error(error);
    })
};