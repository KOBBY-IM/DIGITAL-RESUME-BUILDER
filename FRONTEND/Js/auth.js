document.addEventListener('DOMContentLoaded', () => {
  const signupForm = document.getElementById('signupForm');
  const loginForm = document.getElementById('loginForm');

  // Handle Sign Up Form Submission
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        alert('Passwords do not match');
        return;
      }

      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name, email, password, confirmPassword }),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Registration successful!');
          window.location.href = 'loginindex.html';
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.error('Signup form not found');
  }

  // Handle Login Form Submission
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = document.getElementById('loginEmail').value;
      const password = document.getElementById('loginPassword').value;

      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Login successful!');
          localStorage.setItem('token', data.token); // Save JWT token
          console.log('Token stored:', data.token); // Debugging
          window.location.href = 'loginindex.html'; // Redirect to home page
        } else {
          alert(`Error: ${data.message}`);
        }
      } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
      }
    });
  } else {
    console.error('Login form not found');
  }
});

// Logout function
function logout() {
  localStorage.removeItem('token');
  window.location.href = 'test.html';
}

function templatepage() {
  window.location.href = 'template.html';
}

function homepage() {
  window.location.href = 'loginindex.html';
}
