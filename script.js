// Playful Mind Academy - Main JavaScript File

// Get modal elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');

// Get button elements
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const getStartedBtn = document.getElementById('getStartedBtn');

// Get close elements
const closeLogin = document.getElementById('closeLogin');
const closeRegister = document.getElementById('closeRegister');

// Get switch links
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Get forms
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');

// Modal Control Functions
function openModal(modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
}

function closeModal(modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Re-enable scrolling
}

// Event Listeners for Opening Modals
loginBtn.addEventListener('click', () => {
    openModal(loginModal);
});

registerBtn.addEventListener('click', () => {
    openModal(registerModal);
});

getStartedBtn.addEventListener('click', () => {
    openModal(registerModal);
});

// Event Listeners for Closing Modals
closeLogin.addEventListener('click', () => {
    closeModal(loginModal);
});

closeRegister.addEventListener('click', () => {
    closeModal(registerModal);
});

// Event Listeners for Switching Between Modals
switchToRegister.addEventListener('click', () => {
    closeModal(loginModal);
    openModal(registerModal);
});

switchToLogin.addEventListener('click', () => {
    closeModal(registerModal);
    openModal(loginModal);
});

// Close modal when clicking outside of it
window.addEventListener('click', (event) => {
    if (event.target === loginModal) {
        closeModal(loginModal);
    }
    if (event.target === registerModal) {
        closeModal(registerModal);
    }
});

// Close modal on Escape key press
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeModal(loginModal);
        closeModal(registerModal);
    }
});

// Validation Functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePassword(password) {
    return password.length >= 6;
}

function validateName(name) {
    return name.trim().length >= 2;
}

function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    errorElement.textContent = message;
    errorElement.style.display = 'block';
}

function hideError(elementId) {
    const errorElement = document.getElementById(elementId);
    errorElement.style.display = 'none';
}

function hideAllErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach(element => {
        element.style.display = 'none';
    });
}

// Login Form Submission
loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideAllErrors();

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    let isValid = true;

    // Validate email
    if (!email) {
        showError('loginEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('loginEmailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('loginPasswordError', 'Password is required');
        isValid = false;
    }

    if (isValid) {
        // Here you would typically send the data to a server
        console.log('Login form submitted:', { email, password });
        
        // Show success message
        alert('Login successful! Welcome back to Playful Mind Academy!');
        
        // Reset form and close modal
        loginForm.reset();
        closeModal(loginModal);
        
        // In a real application, you would redirect to a dashboard or home page
        // window.location.href = '/dashboard';
    }
});

// Register Form Submission
registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    hideAllErrors();

    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    let isValid = true;

    // Validate name
    if (!name) {
        showError('registerNameError', 'Name is required');
        isValid = false;
    } else if (!validateName(name)) {
        showError('registerNameError', 'Name must be at least 2 characters long');
        isValid = false;
    }

    // Validate email
    if (!email) {
        showError('registerEmailError', 'Email is required');
        isValid = false;
    } else if (!validateEmail(email)) {
        showError('registerEmailError', 'Please enter a valid email address');
        isValid = false;
    }

    // Validate password
    if (!password) {
        showError('registerPasswordError', 'Password is required');
        isValid = false;
    } else if (!validatePassword(password)) {
        showError('registerPasswordError', 'Password must be at least 6 characters long');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showError('registerConfirmPasswordError', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showError('registerConfirmPasswordError', 'Passwords do not match');
        isValid = false;
    }

    if (isValid) {
        // Here you would typically send the data to a server
        console.log('Register form submitted:', { name, email, password });
        
        // Show success message
        alert('Registration successful! Welcome to Playful Mind Academy!');
        
        // Reset form and close modal
        registerForm.reset();
        closeModal(registerModal);
        
        // In a real application, you would redirect to a dashboard or home page
        // window.location.href = '/dashboard';
    }
});

// Real-time validation on input
document.getElementById('loginEmail').addEventListener('input', () => {
    hideError('loginEmailError');
});

document.getElementById('loginPassword').addEventListener('input', () => {
    hideError('loginPasswordError');
});

document.getElementById('registerName').addEventListener('input', () => {
    hideError('registerNameError');
});

document.getElementById('registerEmail').addEventListener('input', () => {
    hideError('registerEmailError');
});

document.getElementById('registerPassword').addEventListener('input', () => {
    hideError('registerPasswordError');
});

document.getElementById('registerConfirmPassword').addEventListener('input', () => {
    hideError('registerConfirmPasswordError');
});

// Smooth scroll for "Learn More" button
document.querySelector('.btn-learn-more').addEventListener('click', () => {
    document.querySelector('.features').scrollIntoView({ behavior: 'smooth' });
});

// Console welcome message
console.log('%c Welcome to Playful Mind Academy! ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
console.log('%c Learn through play and unlock your potential! ', 'color: #667eea; font-size: 14px;');
