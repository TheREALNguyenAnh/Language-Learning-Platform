// public/homeScript.js
document.addEventListener('DOMContentLoaded', async () => {
    // Fetch user data from the server
    const response = await fetch('/user-data', {
      method: 'GET',
      credentials: 'include', // Include cookies in the request
    });
  
    if (response.ok) {
      const { username } = await response.json();
      document.getElementById('welcomemessage').textContent = `Welcome, ${username}`;
    }
    
  });
  document.getElementById('logoutButton').addEventListener('click', async () => {
    const logoutResponse = await fetch('/logout', {
      method: 'POST',
      credentials: 'include', // Include cookies in the request
    });

    if (logoutResponse.ok) {
      window.location.href = '/'; // Redirect to login or home page
    } else {
      console.error('Logout failed');
    }
    
  });
  document.getElementById('gameButton').addEventListener('click', function() {
    window.location.href = '/flashcards-game';
  });
