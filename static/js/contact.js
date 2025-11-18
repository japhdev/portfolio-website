/**
 * Contact Form Submission Script
* @author JAPH
* @version 1.0.0
* @description Handles contact form submission with validation, feedback messages, and error handling
 */

document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleFormSubmit);
    }
});

/**
* Handles form submission
 */
async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);
    
    // Get and trim values
    const name = formData.get('name').trim();
    const email = formData.get('email').trim();
    const message = formData.get('message').trim();
    
    // Frontend validation
    if (!name || !email || !message) {
        showErrorMessage('Please fill in all fields');
        return;
    }
    
    if (!validateEmail(email)) {
        showErrorMessage('Please enter a valid email address');
        return;
    }
    
    try {
        // Show sending state
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        // Set request timeout (10 seconds)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        // Send to backend
        const response = await fetch('/enviar-formulario', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        const data = await response.json();
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || 'Failed to send message');
        }
        
        // Success
        showSuccessMessage(data.message || 'Message sent successfully!');
        form.reset();
        
    } catch (error) {
        // Error handling
        const errorMessage = error.name === 'AbortError' 
            ? 'Request timed out. Please try again.' 
            : error.message || 'Unknown error occurred while sending your message';
        
        showErrorMessage(errorMessage);
        console.error('Form submission error:', error);
        
    } finally {
        // Restore button
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
    }
}

// Improved email validation
function validateEmail(email) {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(email);
}

// Show success message
function showSuccessMessage(message) {
    removeExistingMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'form-message success-message';
    successDiv.innerHTML = `
        <p><i class="fas fa-check-circle"></i> ${message}</p>
    `;
    
    insertMessage(successDiv);
}

// Show error message
function showErrorMessage(message) {
    removeExistingMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-message error-message';
    errorDiv.innerHTML = `
        <p><i class="fas fa-exclamation-circle"></i> ${message}</p>
    `;
    
    insertMessage(errorDiv);
}

// Helper: Remove existing messages
function removeExistingMessages() {
    document.querySelectorAll('.form-message').forEach(msg => msg.remove());
}

// Helper: Insert message in DOM
function insertMessage(element) {
    const form = document.getElementById('contact-form');
    const parent = form.parentNode;
    
    // Insert after form
    parent.insertBefore(element, form.nextSibling);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        element.style.opacity = '0';
        setTimeout(() => element.remove(), 500);
    }, 5000);
}