// Funciones de navegación suave
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        // Añadir un pequeño resalte visual para ayudar a la ubicación
        section.style.backgroundColor = '#E8F0FE';
        setTimeout(() => {
            section.style.backgroundColor = '';
            section.style.transition = 'background-color 1s ease';
        }, 1000);
    }
}

// Lógica para pestañas de navegación (SPA)
function switchTab(viewId, navElement) {
    // Ocultar todas las vistas
    const views = document.querySelectorAll('.tab-view');
    views.forEach(view => {
        view.style.display = 'none';
        view.classList.remove('active');
    });

    // Mostrar la vista seleccionada
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block';
        targetView.classList.add('active');
    }

    // Actualizar estilo en la barra de navegación
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    if (navElement) {
        navElement.classList.add('active');
    }

    // Scroll al inicio al cambiar de pestaña
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funciones para manejar los modales (ventanas emergentes)
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'block';
        // Mejorar la accesibilidad: enfocar el botón de cerrar
        const closeBtn = modal.querySelector('.close-btn');
        if(closeBtn) closeBtn.focus();
        
        // Prevenir scroll en el fondo
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        // Restaurar scroll
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modal si se hace clic fuera del contenido
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Cerrar modales con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.style.display === 'block') {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        // Limpiar iframe de Canva si estaba abierto
        const canvaIframe = document.getElementById('canva-iframe');
        if (canvaIframe) canvaIframe.src = '';
    }
});

// Funciones para el modal de Canva
function openCanvaModal() {
    const modal = document.getElementById('modal-canva');
    const iframe = document.getElementById('canva-iframe');
    if (modal && iframe) {
        iframe.src = 'https://www.canva.com/design/DAHXiyErU8Y/0weTc1TAs8imeagy-lOP8g/view?embed';
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeCanvaModal() {
    const modal = document.getElementById('modal-canva');
    const iframe = document.getElementById('canva-iframe');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    // Detener la presentación limpiando el src
    if (iframe) iframe.src = '';
}
