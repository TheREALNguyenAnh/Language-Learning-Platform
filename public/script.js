document.addEventListener('DOMContentLoaded', () => {
  console.log('Language Learning App is running');

  function openTab(evt, tabName) {
    // Declare all variables
    let i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
      tabcontent[i].classList.remove('active');
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(tabName).style.display = "block";
    document.getElementById(tabName).classList.add('active');
    evt.currentTarget.className += " active";
  }

  // Set up tab button event listeners
  document.querySelectorAll('.tablinks').forEach(button => {
    button.addEventListener('click', (event) => {
      openTab(event, button.getAttribute('data-tab'));
    });
  });

  // Function to handle form submission for login
  async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();

    if (response.ok) {
      // Save the token to localStorage or sessionStorage
      localStorage.setItem('authToken', result.token);
      console.log(result.token);
      window.location.href = '/protected'; 
    } else {
      alert(result.message);
    }
  }

  // Function to handle form submission for signup
  async function handleSignUp(event) {
    event.preventDefault();
    const username = document.getElementById('signupUsername').value;
    const password = document.getElementById('signupPassword').value;
    const repeatPassword = document.getElementById('repeatPassword').value;

    if (password !== repeatPassword) {
      alert('Passwords do not match');
      return;
    }

    const response = await fetch('/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const result = await response.json();
    alert(result.message);
  }
  //Testing function to test protected data
  async function fetchProtectedData() {
    const token = localStorage.getItem('authToken');

    const response = await fetch('/protected', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }), // Send the token in the request body
    });

    const result = await response.json();
    console.log(result);
  }

  // Attach event listeners to the forms
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('signupForm').addEventListener('submit', handleSignUp);

  if (window.location.pathname === '/protected') {
    fetchProtectedData();
  }
  // Open default tab on load
  document.getElementById("defaultOpen").click();
});
