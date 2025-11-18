/** 
 * CV Modal and Navbar Script
 * @author JAPH
 * @version 1.0.0
 * @description Handles CV modal functionality and navbar effects
 */

// Navbar scroll effect
window.addEventListener('scroll', function() {
    const nav = document.querySelector('nav');
    if (window.scrollY > 50) {
        nav.style.backgroundColor = 'transparent';
        nav.style.padding = '0px 0';
    } else {
        nav.style.backgroundColor = 'transparent';
        nav.style.padding = '0px 0';
    }
});

// Smooth scrolling for navigation links
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});



// Modal para el CV
document.addEventListener('DOMContentLoaded', function() {
    // Elementos del modal del CV
    const previewBtn = document.querySelector('.cv-preview-btn');
    const cvModal = document.getElementById('cv-modal');
    const closeCvModalBtn = document.querySelector('#cv-modal .close-modal');
    const closeCvBtn = document.querySelector('#cv-modal .close-btn');

    // Abrir modal del CV
    if (previewBtn && cvModal) {
        previewBtn.addEventListener('click', function() {
            cvModal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });
    }

    // Cerrar modal del CV
    function closeCvModal() {
        if (cvModal) {
            cvModal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    if (closeCvModalBtn) closeCvModalBtn.addEventListener('click', closeCvModal);
    if (closeCvBtn) closeCvBtn.addEventListener('click', closeCvModal);

    // Cerrar modal del CV al hacer clic fuera
    window.addEventListener('click', function(event) {
        if (event.target === cvModal) {
            closeCvModal();
        }
    });

    // Cerrar con la tecla ESC
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && cvModal && cvModal.style.display === 'block') {
            closeCvModal();
        }
    });
});

// Hamburguesa Menu Toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            navMenu.classList.toggle('active');
            
            document.body.style.overflow = !isExpanded ? 'hidden' : '';
        });
        
        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    hamburger.setAttribute('aria-expanded', 'false');
                    navMenu.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
});
