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

// ========================================================
// LÓGICA DEL SIMULADOR PRÁCTICO INTERACTIVO
// ========================================================

const simStepData = {
    1: {
        title: "Buscar su destino",
        desc: "Para comenzar a pedir un auto, toque en el celular la barra que dice <strong>\"¿A dónde vas?\"</strong>.",
        hint: "El elemento que debe tocar en la pantalla del celular tiene un resplandor azul parpadeante.",
        progress: 20
    },
    2: {
        title: "Seleccionar el destino",
        desc: "En este ejercicio iremos al Hospital Central. Toque la tarjeta que dice <strong>'🏥 Hospital Central'</strong>.",
        hint: "Fíjese en la lista de sugerencias que tiene el resplandor parpadeante.",
        progress: 40
    },
    3: {
        title: "Elegir auto y método de pago",
        desc: "Revise las opciones de viaje. Puede seleccionar <strong>Efectivo</strong> o <strong>Tarjeta</strong>, y luego tocar el botón negro <strong>'Elegir UberX'</strong>.",
        hint: "Toque 'Comfort' o 'Tarjeta' para practicar cómo cambiar opciones.",
        progress: 60
    },
    4: {
        title: "Confirmar punto de partida",
        desc: "Verifique que el auto lo pase a buscar por su puerta (Av. Rivadavia 2500) y toque el botón <strong>'Confirmar punto de partida'</strong>.",
        hint: "En la app real, el pin verde indica exactamente dónde esperará al vehículo.",
        progress: 80
    },
    5: {
        title: "¡Viaje confirmado! (Seguridad)",
        desc: "El chofer está en camino. Preste especial atención a la <strong>patente (AA 123 BB)</strong> y el nombre del chofer (Carlos).",
        hint: "Por seguridad, verifique siempre que la patente y el modelo coincidan antes de abrir la puerta.",
        progress: 100
    }
};

let currentSimStep = 1;
let simSelectedCar = 'uberx';
let simSelectedPayment = 'cash';
let simErrorTimeout = null;

// Manejador inteligente de clics en la pantalla del teléfono virtual
function handlePhoneMisclick(event) {
    // Si el clic provino de una acción válida para el paso actual, no es error
    if (event.target.closest('.sim-valid-action') || 
        event.target.closest('.sim-screen-back') || 
        event.target.closest('.sim-phone-bottom-sheet')) {
        return;
    }
    triggerPhoneError();
}

function triggerPhoneError() {
    const phone = document.getElementById('sim-phone-device');
    const screen = document.querySelector('.phone-screen');
    const errorBadge = document.getElementById('sim-error-badge');

    // Vibración del marco del celular en rojo
    if (phone) {
        phone.classList.remove('shake-error');
        void phone.offsetWidth; // Forzar reflow para reiniciar la animación
        phone.classList.add('shake-error');
    }

    // Destello rojo en la pantalla táctil
    if (screen) {
        screen.classList.remove('screen-error-flash');
        void screen.offsetWidth;
        screen.classList.add('screen-error-flash');
    }

    // Mostrar cartel de aviso flotante
    if (errorBadge) {
        errorBadge.style.display = 'block';
    }

    // Mensaje de ayuda en el panel lateral
    const hintEl = document.getElementById('sim-hint-text');
    if (hintEl) {
        hintEl.innerHTML = '<strong style="color: #d32f2f;">⚠️ Opción incorrecta:</strong> Toque el elemento resaltado en azul parpadeante para continuar.';
    }

    // Quitar estados de error tras 1.4 segundos
    if (simErrorTimeout) clearTimeout(simErrorTimeout);
    simErrorTimeout = setTimeout(() => {
        if (phone) phone.classList.remove('shake-error');
        if (screen) screen.classList.remove('screen-error-flash');
        if (errorBadge) errorBadge.style.display = 'none';
        const data = simStepData[currentSimStep];
        if (data && hintEl) hintEl.textContent = data.hint;
    }, 1400);
}

function simTriggerStep(step, event) {
    if (event) event.stopPropagation(); // Evitar error

    // Cerrar hoja de pago si estaba abierta
    closePaymentSheet();

    currentSimStep = step;

    // Actualizar pantallas del teléfono virtual
    for (let i = 1; i <= 5; i++) {
        const screen = document.getElementById(`sim-screen-${i}`);
        if (screen) {
            screen.style.display = (i === step) ? 'flex' : 'none';
        }
    }

    // Actualizar panel de guía pedagógico
    const data = simStepData[step];
    if (data) {
        const stepNumEl = document.getElementById('sim-step-number');
        const progressEl = document.getElementById('sim-progress-fill');
        const titleEl = document.getElementById('sim-guide-title');
        const descEl = document.getElementById('sim-guide-desc');
        const hintEl = document.getElementById('sim-hint-text');

        if (stepNumEl) stepNumEl.textContent = step;
        if (progressEl) progressEl.style.width = `${data.progress}%`;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.innerHTML = data.desc;
        if (hintEl) hintEl.textContent = data.hint;
    }

    // Mostrar/ocultar botón de paso anterior en el panel lateral
    const prevBtn = document.getElementById('btn-sim-prev');
    if (prevBtn) {
        prevBtn.style.display = (step > 1) ? 'inline-block' : 'none';
    }

    // Actualizar texto del botón de confirmación en paso 3
    if (step === 3) {
        updateCarConfirmButton();
    }
}

function simPrevStep() {
    if (currentSimStep > 1) {
        simTriggerStep(currentSimStep - 1);
    }
}

function restartSimulator() {
    simSelectedCar = 'uberx';
    simSelectedPayment = 'cash';
    selectCarOption('uberx');
    choosePayment('cash', '💵', 'Efectivo');
    simTriggerStep(1);
}

function selectCarOption(type, event) {
    if (event) event.stopPropagation();
    simSelectedCar = type;

    const uberxEl = document.getElementById('car-uberx');
    const comfortEl = document.getElementById('car-comfort');

    if (type === 'uberx') {
        if (uberxEl) uberxEl.classList.add('selected');
        if (comfortEl) comfortEl.classList.remove('selected');
    } else {
        if (comfortEl) comfortEl.classList.add('selected');
        if (uberxEl) uberxEl.classList.remove('selected');
    }
    updateCarConfirmButton();
}

// Abrir selector de método de pago (Hoja inferior dentro del celular)
function openPaymentSheet(event) {
    if (event) event.stopPropagation();
    const sheet = document.getElementById('sim-payment-sheet');
    if (sheet) sheet.style.display = 'block';
}

function closePaymentSheet(event) {
    if (event) event.stopPropagation();
    const sheet = document.getElementById('sim-payment-sheet');
    if (sheet) sheet.style.display = 'none';
}

function choosePayment(method, icon, text, event) {
    if (event) event.stopPropagation();
    simSelectedPayment = method;

    // Actualizar fila principal
    const iconEl = document.getElementById('sim-current-pay-icon');
    const textEl = document.getElementById('sim-current-pay-text');
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = text;

    // Actualizar selección visual en la hoja
    const optCash = document.getElementById('pay-opt-cash');
    const optCard = document.getElementById('pay-opt-card');
    const checkCash = document.getElementById('pay-check-cash');
    const checkCard = document.getElementById('pay-check-card');

    if (method === 'cash') {
        if (optCash) optCash.classList.add('selected');
        if (optCard) optCard.classList.remove('selected');
        if (checkCash) checkCash.style.display = 'inline';
        if (checkCard) checkCard.style.display = 'none';
    } else {
        if (optCard) optCard.classList.add('selected');
        if (optCash) optCash.classList.remove('selected');
        if (checkCard) checkCard.style.display = 'inline';
        if (checkCash) checkCash.style.display = 'none';
    }

    updateCarConfirmButton();
    closePaymentSheet();
}

function updateCarConfirmButton() {
    const btnConfirm = document.querySelector('.uber-cars-sheet .uber-confirm-btn');
    if (btnConfirm) {
        const carName = (simSelectedCar === 'uberx') ? 'UberX' : 'Comfort';
        const payName = (simSelectedPayment === 'cash') ? 'Efectivo' : 'Tarjeta';
        btnConfirm.textContent = `Elegir ${carName} (${payName})`;
    }
}
