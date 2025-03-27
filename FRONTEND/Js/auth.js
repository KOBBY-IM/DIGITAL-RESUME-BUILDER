document.addEventListener('DOMContentLoaded', () => {
  // Check for error parameters in URL
  checkUrlParams();
  
  // Check authentication state
  checkAuthState();

  // Handle Sign Up Form Submission
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', handleSignup);
  }

  // Handle Login Form Submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Initialize logout button if it exists
  initLogoutButton();
});

// Check for URL parameters like error messages or redirects
function checkUrlParams() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // Check for error messages
  const error = urlParams.get('error');
  if (error) {
    let errorMessage = '';
    switch(error) {
      case 'auth_required':
        errorMessage = 'Please log in to access this page';
        break;
      case 'session_expired':
        errorMessage = 'Your session has expired. Please log in again';
        break;
      default:
        errorMessage = 'An error occurred';
    }
    
    // Only show error if not already authenticated
    if (!localStorage.getItem('token')) {
      showMessage(errorMessage, 'error');
      
      // Automatically open login modal if on home page
      const currentPage = window.location.pathname.split('/').pop();
      if (currentPage === 'test.html' || currentPage === '') {
        setTimeout(() => {
          const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
          if (loginModal) loginModal.show();
        }, 1000);
      }
    }
  }
  
  // Check for successful logout
  if (urlParams.get('logout')) {
    showMessage('You have been logged out successfully', 'success');
  }
  
  // Remember the redirect page after login
  const redirect = urlParams.get('redirect');
  if (redirect) {
    sessionStorage.setItem('redirect', redirect);
  }
}

// Check and enforce authentication state
function checkAuthState() {
  const token = localStorage.getItem('token');
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  
  // List of protected pages that require authentication
  const protectedPages = [
    'loginindex.html',
    'editor.html',
    'template.html',
    'template1.html',
    'template2.html'
  ];
  
  // List of auth pages (login, register)
  const authPages = [
    'test.html',
    'login.html',
    'register.html'
  ];
  
  if (token) {
    // User is logged in
    
    // Check if token is expired
    if (isTokenExpired(token)) {
      // Clear expired token
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // If on protected page, redirect to login
      if (protectedPages.includes(currentPage)) {
        window.location.href = 'test.html?error=session_expired';
      }
      return;
    }
    
    // Redirect to dashboard if on auth pages
    if (authPages.includes(currentPage)) {
      window.location.href = 'loginindex.html';
    }
  } else {
    // No token, user is not logged in
    
    // Redirect to login page if on protected pages
    if (protectedPages.includes(currentPage)) {
      // Store the current page to redirect back after login
      const redirectPage = currentPage.replace('.html', '');
      window.location.href = `test.html?error=auth_required&redirect=${redirectPage}`;
    }
  }
  
  // Update UI based on auth state
  updateUI(!!token);
}

// Check if token is expired
function isTokenExpired(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64));
    
    // Expiration time should be provided as seconds since epoch
    // Convert to milliseconds for comparison with Date.now()
    return payload.exp * 1000 < Date.now();
  } catch (error) {
    console.error('Error checking token expiration:', error);
    // If token is malformed, consider it expired
    return true;
  }
}

// Update UI elements based on authentication state
function updateUI(isAuthenticated) {
  // Find login/logout buttons
  const loginBtn = document.querySelector('button[data-bs-target="#loginModal"]');
  const signupBtn = document.querySelector('button[data-bs-target="#signupModal"]');
  const logoutBtn = document.querySelector('button[onclick="logout()"]');
  
  // Update visibility based on auth state
  if (loginBtn && signupBtn) {
    if (isAuthenticated) {
      loginBtn.style.display = 'none';
      signupBtn.style.display = 'none';
      if (logoutBtn) logoutBtn.style.display = 'block';
    } else {
      loginBtn.style.display = 'block';
      signupBtn.style.display = 'block';
      if (logoutBtn) logoutBtn.style.display = 'none';
    }
  }
  
  // Show username if authenticated
  if (isAuthenticated) {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    // Only create welcome element if it doesn't already exist
    if (userData.name && !document.querySelector('.user-display')) {
      const userDisplay = document.createElement('span');
      userDisplay.textContent = `Welcome, ${userData.name}`;
      userDisplay.classList.add('user-display', 'me-3');
      
      // Add to header if it exists
      const header = document.querySelector('.nav-header');
      if (header) {
        header.prepend(userDisplay);
      }
    }
  }
}

// Initialize logout button
function initLogoutButton() {
  // Find logout button (different ways it might be defined)
  const logoutBtn = document.querySelector('button[onclick="logout()"]');
  if (logoutBtn) {
    // Clear the onclick attribute to avoid double handlers
    logoutBtn.removeAttribute('onclick');
    logoutBtn.addEventListener('click', handleLogout);
  }
}

// Validation functions
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/.test(password);
}

// Display form error message
function showFormError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const errorDiv = document.createElement('div');
  errorDiv.className = 'invalid-feedback d-block';
  errorDiv.textContent = message;
  
  // Remove any existing error messages
  const existingError = input.parentElement.querySelector('.invalid-feedback');
  if (existingError) {
    existingError.remove();
  }
  
  input.classList.add('is-invalid');
  input.parentElement.appendChild(errorDiv);
}

// Clear all error messages in a form
function clearFormErrors(form) {
  form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
  form.querySelectorAll('.invalid-feedback').forEach(el => el.remove());
}

// Display toast message
function showMessage(message, type = 'info') {
  // Create message element
  const messageElement = document.createElement('div');
  messageElement.className = `alert alert-${type === 'error' ? 'danger' : type === 'success' ? 'success' : 'info'}`;
  messageElement.textContent = message;
  messageElement.style.position = 'fixed';
  messageElement.style.top = '20px';
  messageElement.style.left = '50%';
  messageElement.style.transform = 'translateX(-50%)';
  messageElement.style.zIndex = '9999';
  messageElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
  messageElement.style.minWidth = '300px';
  messageElement.style.textAlign = 'center';
  
  document.body.appendChild(messageElement);
  
  // Remove after 3 seconds
  setTimeout(() => {
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      document.body.removeChild(messageElement);
    }, 500);
  }, 3000);
}

// Handle signup form submission
async function handleSignup(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Get form values
  const name = form.querySelector('#name').value.trim();
  const email = form.querySelector('#email').value.trim();
  const password = form.querySelector('#password').value;
  const confirmPassword = form.querySelector('#confirmPassword').value;
  
  // Clear previous errors
  clearFormErrors(form);
  
  // Remove any previous alerts
  form.querySelectorAll('.alert').forEach(el => el.remove());
  
  // Client-side validation
  let hasError = false;
  
  if (!name) {
    showFormError('name', 'Name is required');
    hasError = true;
  }
  
  if (!email || !validateEmail(email)) {
    showFormError('email', 'Please enter a valid email address');
    hasError = true;
  }
  
  if (!password || !validatePassword(password)) {
    showFormError('password', 'Password must be at least 8 characters with uppercase, lowercase, number, and special character');
    hasError = true;
  }
  
  if (password !== confirmPassword) {
    showFormError('confirmPassword', 'Passwords do not match');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Disable submit button during API call
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing up...';
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        email,
        password,
        confirmPassword
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    // Show success message
    const successMessage = document.createElement('div');
    successMessage.className = 'alert alert-success';
    successMessage.textContent = 'Registration successful! Please log in.';
    form.prepend(successMessage);
    
    // Reset form
    form.reset();
    
    // Automatically open login modal after 2 seconds
    setTimeout(() => {
      // Close signup modal
      const signupModal = bootstrap.Modal.getInstance(document.getElementById('signupModal'));
      if (signupModal) signupModal.hide();
      
      // Open login modal
      const loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
      loginModal.show();
    }, 2000);
  } catch (error) {
    console.error('Registration error:', error);
    
    // Show error message at top of form
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger';
    errorMessage.textContent = error.message || 'An error occurred during registration';
    form.prepend(errorMessage);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Sign Up';
  }
}

// Handle login form submission
async function handleLogin(e) {
  e.preventDefault();
  
  const form = e.target;
  const submitButton = form.querySelector('button[type="submit"]');
  
  // Get form values
  const email = form.querySelector('#loginEmail').value.trim();
  const password = form.querySelector('#loginPassword').value;
  
  // Clear previous errors
  clearFormErrors(form);
  
  // Remove any previous alerts
  form.querySelectorAll('.alert').forEach(el => el.remove());
  
  // Basic validation
  let hasError = false;
  
  if (!email) {
    showFormError('loginEmail', 'Email is required');
    hasError = true;
  }
  
  if (!password) {
    showFormError('loginPassword', 'Password is required');
    hasError = true;
  }
  
  if (hasError) return;
  
  // Disable submit button during API call
  submitButton.disabled = true;
  submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
  
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    // Store authentication data
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Check if there's a redirect URL
    const redirect = sessionStorage.getItem('redirect');
    if (redirect) {
      sessionStorage.removeItem('redirect');
      window.location.href = `${redirect}.html`;
    } else {
      // Redirect to dashboard
      window.location.href = 'loginindex.html?t=' + Date.now();
    }
  } catch (error) {
    console.error('Login error:', error);
    
    // Show error message at top of form
    const errorMessage = document.createElement('div');
    errorMessage.className = 'alert alert-danger';
    errorMessage.textContent = error.message || 'Invalid email or password';
    form.prepend(errorMessage);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Log In';
  }
}

// Handle logout functionality
async function handleLogout() {
  const token = localStorage.getItem('token');
  
  if (token) {
    try {
      // Call logout API to blacklist the token
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });
    } catch (err) {
      console.error('Logout error:', err);
      // Continue with client-side logout even if API call fails
    }
  }

  // Clear client-side authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirect to home page with logout parameter
  window.location.href = 'test.html?logout=' + Date.now();
}

// Public function that can be called from onclick attributes
function logout() {
  handleLogout();
}