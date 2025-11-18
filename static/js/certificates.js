
/** 
 * Certificate Lightbox Script
 * @author JAPH
 * @version 1.0.0
 * @description Handles lightbox functionality for certificate images
 */

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