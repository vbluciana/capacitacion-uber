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
        if (event.target.id === 'modal-canva') {
            const canvaIframe = document.getElementById('canva-iframe');
            if (canvaIframe) canvaIframe.src = '';
        }
    }
}

// Cerrar modales y barra lateral con la tecla Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeFaqSidebar();
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

// Funciones para el modal de Canva (reutilizable)
function openCanvaModal(url, title) {
    const modal = document.getElementById('modal-canva');
    const iframe = document.getElementById('canva-iframe');
    const heading = document.getElementById('canva-modal-title') || (modal ? modal.querySelector('h2') : null);
    if (modal && iframe) {
        if (heading && title) heading.textContent = title;
        iframe.src = url;
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

// Variables y lógica para la Encuesta paso a paso
let currentEncuestaStep = 1;
const totalEncuestaSteps = 4;

function updateEncuestaUI() {
    // Mostrar solo el paso actual
    const steps = document.querySelectorAll('.encuesta-step');
    steps.forEach(step => {
        const stepNum = parseInt(step.getAttribute('data-step'));
        step.style.display = (stepNum === currentEncuestaStep) ? 'block' : 'none';
    });

    // Actualizar indicador de paso y barra de progreso
    const stepText = document.getElementById('encuesta-step-text');
    if (stepText) {
        stepText.textContent = `Pregunta ${currentEncuestaStep} de ${totalEncuestaSteps}`;
    }
    const progressFill = document.getElementById('encuesta-progress-fill');
    if (progressFill) {
        progressFill.style.width = `${(currentEncuestaStep / totalEncuestaSteps) * 100}%`;
    }

    // Ocultar mensaje de error
    const errorMsg = document.getElementById('encuesta-error');
    if (errorMsg) errorMsg.style.display = 'none';

    // Botón Anterior
    const prevBtn = document.getElementById('btn-encuesta-prev');
    if (prevBtn) {
        prevBtn.style.display = (currentEncuestaStep > 1) ? 'inline-block' : 'none';
    }

    // Botón Siguiente / Enviar
    const nextBtn = document.getElementById('btn-encuesta-next');
    if (nextBtn) {
        nextBtn.textContent = (currentEncuestaStep === totalEncuestaSteps) ? 'Enviar respuestas ✓' : 'Siguiente →';
        nextBtn.disabled = false;
    }
}

function nextEncuestaStep() {
    // Validar que se haya seleccionado una opción en el paso actual
    const currentRadio = document.querySelector(`input[name="p${currentEncuestaStep}"]:checked`);
    const errorMsg = document.getElementById('encuesta-error');
    if (!currentRadio) {
        if (errorMsg) errorMsg.style.display = 'block';
        return;
    }

    if (errorMsg) errorMsg.style.display = 'none';

    if (currentEncuestaStep < totalEncuestaSteps) {
        currentEncuestaStep++;
        updateEncuestaUI();
    } else {
        enviarEncuesta();
    }
}

function prevEncuestaStep() {
    if (currentEncuestaStep > 1) {
        currentEncuestaStep--;
        updateEncuestaUI();
    }
}

// Finalizar presentación y abrir encuesta
function finalizarCanvaModal() {
    closeCanvaModal();
    const encuesta = document.getElementById('modal-encuesta');
    if (encuesta) {
        const form = document.getElementById('form-encuesta');
        if (form) form.reset();
        currentEncuestaStep = 1;
        updateEncuestaUI();
        encuesta.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Cerrar encuesta
function closeEncuesta() {
    const encuesta = document.getElementById('modal-encuesta');
    if (encuesta) {
        encuesta.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Enviar encuesta
function enviarEncuesta() {
    closeEncuesta();
}

// Funciones para la Barra Lateral (Sidebar) de FAQ
function openFaqSidebar() {
    const sidebar = document.getElementById('faq-sidebar');
    const overlay = document.getElementById('faq-overlay');
    if (sidebar && overlay) {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeFaqSidebar() {
    const sidebar = document.getElementById('faq-sidebar');
    const overlay = document.getElementById('faq-overlay');
    if (sidebar && overlay) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

function toggleFaqAccordion(button) {
    const item = button.closest('.faq-item');
    if (item) {
        item.classList.toggle('active');
    }
}

function enviarPreguntaUsuario(event) {
    event.preventDefault();
    const nameInput = document.getElementById('faq-user-name');
    const questionInput = document.getElementById('faq-user-question');
    const successMsg = document.getElementById('faq-form-success');
    const questionsSection = document.getElementById('user-questions-section');
    const questionsList = document.getElementById('user-questions-list');

    const questionText = questionInput ? questionInput.value.trim() : '';
    const authorName = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : 'Usuario';

    if (!questionText) return;

    if (questionsSection && questionsList) {
        questionsSection.style.display = 'block';
        const bubble = document.createElement('div');
        bubble.className = 'user-question-bubble';
        bubble.innerHTML = `
            <p><strong>${escapeHtml(authorName)}:</strong> "${escapeHtml(questionText)}"</p>
            <span>Estado: Recibida (un facilitador responderá pronto)</span>
        `;
        questionsList.prepend(bubble);
    }

    if (successMsg) {
        successMsg.style.display = 'block';
        setTimeout(() => {
            successMsg.style.display = 'none';
        }, 4000);
    }

    if (questionInput) questionInput.value = '';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
