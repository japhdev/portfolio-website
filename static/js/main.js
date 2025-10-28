/* ============================================= */
/*               CORE NAVIGATION                 */
/* ============================================= */

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

/* ============================================= */
/*               MODAL FUNCTIONS                 */
/* ============================================= */

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

/* ============================================= */
/*               CERTIFICATES MODAL              */
/* ============================================= */

// Lightbox para certificados - VERSIÓN CORREGIDA
document.addEventListener('DOMContentLoaded', function() {
    const certificateModal = document.getElementById('certificate-modal');
    const modalImg = document.getElementById('modal-image');
    const caption = document.getElementById('modal-caption');
    const closeBtn = document.querySelector('#certificate-modal .close-modal');
    
    console.log('Certificate modal debug:', {
        modal: certificateModal,
        closeBtn: closeBtn,
        modalImg: modalImg,
        caption: caption
    });
    
    // Abrir modal al hacer clic en certificados
    document.querySelectorAll('.cert-clickable').forEach(img => {
        img.addEventListener('click', function() {
            console.log('Opening certificate modal');
            certificateModal.style.display = 'flex';
            modalImg.src = this.src;
            modalImg.alt = this.alt;
            caption.textContent = this.alt;
        });
    });
    
    // Cerrar modal - MÉTODO DIRECTO
    if (closeBtn) {
        closeBtn.addEventListener('click', function(e) {
            console.log('Close button clicked - closing modal');
            e.preventDefault();
            e.stopPropagation();
            certificateModal.style.display = 'none';
        });
    }
    
    // Cerrar al hacer clic fuera de la imagen
    certificateModal.addEventListener('click', function(e) {
        console.log('Modal clicked - target:', e.target);
        if (e.target === certificateModal) {
            console.log('Background clicked - closing modal');
            certificateModal.style.display = 'none';
        }
    });
    
    // Cerrar con tecla ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && certificateModal.style.display === 'flex') {
            console.log('ESC pressed - closing modal');
            certificateModal.style.display = 'none';
        }
    });
});