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

document.getElementById('gameButton').addEventListener('click', function() {
  window.location.href = '/flashcards-game';
});

