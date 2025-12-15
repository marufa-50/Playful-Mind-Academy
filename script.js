// Playful Mind Academy - Main JavaScript File

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
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
    if (loginBtn) {
        loginBtn.addEventListener('click', () => {
            openModal(loginModal);
        });
    }

    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            openModal(registerModal);
        });
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener('click', () => {
            openModal(registerModal);
        });
    }

    // Event Listeners for Closing Modals
    if (closeLogin) {
        closeLogin.addEventListener('click', () => {
            closeModal(loginModal);
        });
    }

    if (closeRegister) {
        closeRegister.addEventListener('click', () => {
            closeModal(registerModal);
        });
    }

    // Event Listeners for Switching Between Modals
    if (switchToRegister) {
        switchToRegister.addEventListener('click', () => {
            closeModal(loginModal);
            openModal(registerModal);
        });
    }

    if (switchToLogin) {
        switchToLogin.addEventListener('click', () => {
            closeModal(registerModal);
            openModal(loginModal);
        });
    }

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
        if (!errorElement) return;
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }

    function hideError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (!errorElement) return;
        errorElement.style.display = 'none';
    }

    function hideAllErrors() {
        const errorElements = document.querySelectorAll('.error-message');
        errorElements.forEach(element => {
            element.style.display = 'none';
        });
    }

    // Login Form Submission
    if (loginForm) {
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
    }

    // Register Form Submission
    if (registerForm) {
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
    }

    // Real-time validation on input
    const loginEmail = document.getElementById('loginEmail');
    if (loginEmail) {
        loginEmail.addEventListener('input', () => {
            hideError('loginEmailError');
        });
    }

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) {
        loginPassword.addEventListener('input', () => {
            hideError('loginPasswordError');
        });
    }

    const registerName = document.getElementById('registerName');
    if (registerName) {
        registerName.addEventListener('input', () => {
            hideError('registerNameError');
        });
    }

    const registerEmail = document.getElementById('registerEmail');
    if (registerEmail) {
        registerEmail.addEventListener('input', () => {
            hideError('registerEmailError');
        });
    }

    const registerPassword = document.getElementById('registerPassword');
    if (registerPassword) {
        registerPassword.addEventListener('input', () => {
            hideError('registerPasswordError');
        });
    }

    const registerConfirmPassword = document.getElementById('registerConfirmPassword');
    if (registerConfirmPassword) {
        registerConfirmPassword.addEventListener('input', () => {
            hideError('registerConfirmPasswordError');
        });
    }

    // Smooth scroll for "Learn More" button
    const learnMoreBtn = document.querySelector('.btn-learn-more');
    const featuresSection = document.querySelector('.features');
    if (learnMoreBtn && featuresSection) {
        learnMoreBtn.addEventListener('click', () => {
            featuresSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // Console welcome message
    console.log('%c Welcome to Playful Mind Academy! ', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 20px; padding: 10px; border-radius: 5px;');
    console.log('%c Learn through play and unlock your potential! ', 'color: #667eea; font-size: 14px;');
});
