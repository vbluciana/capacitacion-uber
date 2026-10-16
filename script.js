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
        if (event.target.id === 'modal-encuesta') {
            closeEncuesta();
            return;
        }
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
        if (event.target.id === 'modal-canva') {
            stopCanvaModalMedia();
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
                if (modal.id === 'modal-encuesta') {
                    closeEncuesta();
                    return;
                }
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        });
        stopCanvaModalMedia();
    }
});

// Funciones para el modal de Canva (reutilizable)
let currentCanvaGuideUrl = '';
let currentCanvaDemoUrl = '';
let currentModuleId = null;
const moduleProgressStorageKey = 'uberTrainingCompletedModules';
const moduleDefinitions = {
    1: {
        title: 'Módulo 1: Primeros Pasos',
        guideUrl: 'https://www.canva.com/design/DAHX8hIW2g4/s2kbGXi2XHgoSO36PWaQPw/view?embed',
        demoUrl: 'https://www.youtube.com/embed/ERVRVqlHwJk'
    },
    2: {
        title: 'Módulo 2: Pedir un Viaje',
        guideUrl: 'https://www.canva.com/design/DAHX8iPiL44/hhPkYl3F4QvCrri1YWeSeA/view?embed'
    }
};
let completedModules = loadCompletedModules();

function loadCompletedModules() {
    try {
        const savedModules = JSON.parse(localStorage.getItem(moduleProgressStorageKey) || '[]');
        return new Set(Array.isArray(savedModules) ? savedModules.filter(id => Number.isInteger(id) && id >= 1 && id <= 3) : []);
    } catch (error) {
        return new Set();
    }
}

function updateModulesProgress() {
    const completedCount = completedModules.size;
    const progressText = document.getElementById('modules-progress-text');
    const progressPercent = document.getElementById('modules-progress-percent');
    const progressTrack = document.querySelector('.modules-progress-track');
    const progressFill = document.getElementById('modules-progress-fill');
    const module2Button = document.getElementById('module-2-start');
    const module3Button = document.getElementById('module-3-start');
    const lockMessage = document.getElementById('module-lock-message');
    const nextLockedModule = !completedModules.has(1) ? 2 : !completedModules.has(2) ? 3 : null;

    if (progressText) progressText.textContent = `${completedCount} de 3 módulos completados`;
    if (progressPercent) progressPercent.textContent = `${Math.round(completedCount / 3 * 100)}%`;
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completedCount));
    if (progressFill) progressFill.style.width = `${completedCount / 3 * 100}%`;
    if (module2Button) module2Button.disabled = !completedModules.has(1);
    if (module3Button) module3Button.disabled = !completedModules.has(2);
    if (lockMessage) {
        lockMessage.style.display = nextLockedModule ? 'block' : 'none';
        lockMessage.textContent = nextLockedModule === 2
            ? 'Finalice la encuesta del Módulo 1 para desbloquear el Módulo 2.'
            : 'Finalice la encuesta del Módulo 2 para desbloquear el Módulo 3.';
    }

    document.querySelectorAll('.module-card[data-module-id]').forEach(card => {
        card.classList.toggle('completed', completedModules.has(Number(card.dataset.moduleId)));
    });
}

function completeModule(moduleId) {
    completedModules.add(moduleId);
    try {
        localStorage.setItem(moduleProgressStorageKey, JSON.stringify([...completedModules]));
    } catch (error) {
        // Keep progress for this page session if browser storage is unavailable.
    }
    updateModulesProgress();
}

function resetModulesProgress() {
    openModal('modal-reset-progress');
    document.querySelector('#modal-reset-progress .reset-progress-actions button')?.focus();
}

function confirmResetModulesProgress() {
    try {
        localStorage.removeItem(moduleProgressStorageKey);
    } catch (error) {
        window.alert('No se pudo reiniciar el progreso. Inténtelo nuevamente.');
        return;
    }

    completedModules.clear();
    updateModulesProgress();
    closeModal('modal-reset-progress');
}

function startModule(moduleId) {
    if (moduleId === 2 && !completedModules.has(1)) return;
    if (moduleId === 3 && !completedModules.has(2)) return;
    currentModuleId = moduleId;

    if (moduleId === 3) {
        openModal('modal3');
        return;
    }

    const module = moduleDefinitions[moduleId];
    if (module) openCanvaModal(module.guideUrl, module.title, module.demoUrl, moduleId);
}

function openEncuestaForCurrentModule() {
    const encuesta = document.getElementById('modal-encuesta');
    if (!encuesta) return;

    const formIframe = document.getElementById('google-form-iframe');
    if (formIframe && !formIframe.src) {
        formIframe.src = formIframe.dataset.src;
    }
    encuesta.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function finalizarModuloInfo() {
    closeModal('modal3');
    openEncuestaForCurrentModule();
}

function openCanvaModal(url, title, demoUrl, moduleId) {
    const modal = document.getElementById('modal-canva');
    const iframe = document.getElementById('canva-iframe');
    const heading = document.getElementById('canva-modal-title') || (modal ? modal.querySelector('h2') : null);
    if (modal && iframe) {
        if (heading && title) heading.textContent = title;
        currentCanvaGuideUrl = url;
        currentCanvaDemoUrl = demoUrl || '';
        currentModuleId = moduleId || currentModuleId;
        switchCanvaModalView('guide');
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function switchCanvaModalView(view) {
    const canvaWrapper = document.querySelector('.canva-wrapper');
    const demoWrapper = document.getElementById('demo-wrapper');
    const canvaIframe = document.getElementById('canva-iframe');
    const demoIframe = document.getElementById('demo-iframe');
    const demoUnavailable = document.getElementById('demo-unavailable');
    const guideButton = document.getElementById('btn-modal-guide');
    const demoButton = document.getElementById('btn-modal-demo');
    const showGuide = view === 'guide';
    const showDemoVideo = !showGuide && Boolean(currentCanvaDemoUrl);

    if (canvaWrapper) canvaWrapper.style.display = showGuide ? 'block' : 'none';
    if (demoWrapper) demoWrapper.style.display = showGuide ? 'none' : 'flex';
    if (canvaIframe) canvaIframe.src = showGuide ? currentCanvaGuideUrl : '';
    if (demoIframe) {
        demoIframe.src = showDemoVideo ? currentCanvaDemoUrl : '';
        demoIframe.style.display = showDemoVideo ? 'block' : 'none';
    }
    if (demoUnavailable) demoUnavailable.style.display = !showGuide && !showDemoVideo ? 'block' : 'none';
    if (guideButton) {
        guideButton.classList.toggle('active', showGuide);
        guideButton.setAttribute('aria-pressed', String(showGuide));
    }
    if (demoButton) {
        demoButton.classList.toggle('active', !showGuide);
        demoButton.setAttribute('aria-pressed', String(!showGuide));
    }
}

function stopCanvaModalMedia() {
    const canvaIframe = document.getElementById('canva-iframe');
    const demoIframe = document.getElementById('demo-iframe');
    if (canvaIframe) canvaIframe.src = '';
    if (demoIframe) demoIframe.src = '';
}

function closeCanvaModal() {
    const modal = document.getElementById('modal-canva');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    stopCanvaModalMedia();
}

// Finalizar presentación y abrir encuesta
function finalizarCanvaModal() {
    closeCanvaModal();
    openEncuestaForCurrentModule();
}

// Cerrar encuesta
function closeEncuesta() {
    const encuesta = document.getElementById('modal-encuesta');
    if (encuesta) {
        encuesta.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
    const formIframe = document.getElementById('google-form-iframe');
    if (formIframe) formIframe.src = '';
}

// Confirmar el envío en Google Forms y completar el módulo
function enviarEncuesta() {
    if (currentModuleId) completeModule(currentModuleId);
    currentModuleId = null;
    closeEncuesta();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateModulesProgress);
} else {
    updateModulesProgress();
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
        title: "Escribir su destino",
        desc: "Escriba en el campo del celular el lugar al que quiere ir y toque <strong>Buscar destino</strong>.",
        hint: "Puede escribir el nombre de un lugar o una dirección.",
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
        desc: "Arrastre el marcador rojo hasta el punto azul, que indica su ubicación actual. Luego toque <strong>Confirmar punto de partida</strong>.",
        hint: "Mantenga presionado el marcador rojo y muévalo hasta el punto azul.",
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
let pickupDragPointerId = null;
let pickupMarkerPosition = { left: 70, top: 50 };

function updateDestinationSearch() {
    const input = document.getElementById('sim-destination-input');
    const result = document.getElementById('sim-destination-result');
    const destination = input ? input.value.trim() : '';
    if (result) result.textContent = destination ? `Buscar: ${destination}` : 'Buscar destino';
}

function searchSimulatorDestination(event) {
    if (event) event.stopPropagation();
    const input = document.getElementById('sim-destination-input');
    const destination = input ? input.value.trim() : '';
    if (!destination) {
        if (input) input.focus();
        const hint = document.getElementById('sim-hint-text');
        if (hint) hint.textContent = 'Escriba primero el nombre de un lugar o una dirección.';
        return;
    }
    const selectedDestination = document.getElementById('sim-selected-destination');
    if (selectedDestination) selectedDestination.textContent = `Destino: ${destination}`;
    simTriggerStep(3, event);
}

function submitDestinationOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchSimulatorDestination(event);
    }
}

function setPickupMarkerPosition(left, top) {
    const marker = document.getElementById('pickup-marker');
    if (!marker) return;
    pickupMarkerPosition = {
        left: Math.min(92, Math.max(8, left)),
        top: Math.min(85, Math.max(15, top))
    };
    marker.style.left = `${pickupMarkerPosition.left}%`;
    marker.style.top = `${pickupMarkerPosition.top}%`;
}

function resetPickupMarker() {
    const marker = document.getElementById('pickup-marker');
    const confirmButton = document.getElementById('confirm-pickup-btn');
    pickupDragPointerId = null;
    setPickupMarkerPosition(70, 50);
    if (marker) {
        marker.classList.remove('pickup-marker-confirmed');
        marker.querySelector('.pickup-tag').textContent = 'Mover aquí';
    }
    if (confirmButton) confirmButton.disabled = true;
}

function checkPickupMarkerPosition() {
    const map = document.getElementById('pickup-map');
    const marker = document.getElementById('pickup-marker');
    const currentLocation = document.querySelector('.pickup-current-dot');
    const confirmButton = document.getElementById('confirm-pickup-btn');
    if (!map || !marker || !currentLocation || !confirmButton) return;

    const mapBounds = map.getBoundingClientRect();
    const markerBounds = marker.getBoundingClientRect();
    const locationBounds = currentLocation.getBoundingClientRect();
    const markerX = markerBounds.left + markerBounds.width / 2;
    const markerY = markerBounds.top + markerBounds.height / 2;
    const locationX = locationBounds.left + locationBounds.width / 2;
    const locationY = locationBounds.top + locationBounds.height / 2;
    const closeEnough = Math.hypot(markerX - locationX, markerY - locationY) <= Math.max(24, mapBounds.width * 0.09);

    if (closeEnough) {
        setPickupMarkerPosition(
            (locationX - mapBounds.left) / mapBounds.width * 100,
            (locationY - mapBounds.top) / mapBounds.height * 100
        );
        marker.classList.add('pickup-marker-confirmed');
        marker.querySelector('.pickup-tag').textContent = 'Punto confirmado';
        confirmButton.disabled = false;
        const hint = document.getElementById('sim-hint-text');
        if (hint) hint.textContent = '¡Bien hecho! Ya puede confirmar el punto de partida.';
    } else {
        marker.classList.remove('pickup-marker-confirmed');
        marker.querySelector('.pickup-tag').textContent = 'Mover aquí';
        confirmButton.disabled = true;
    }
}

function startPickupDrag(event) {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    pickupDragPointerId = event.pointerId;
    event.currentTarget.setPointerCapture(event.pointerId);
}

function movePickupMarker(event) {
    if (event.pointerId !== pickupDragPointerId) return;
    const map = document.getElementById('pickup-map');
    if (!map) return;
    event.preventDefault();
    const bounds = map.getBoundingClientRect();
    setPickupMarkerPosition(
        (event.clientX - bounds.left) / bounds.width * 100,
        (event.clientY - bounds.top) / bounds.height * 100
    );
}

function finishPickupDrag(event) {
    if (event.pointerId !== pickupDragPointerId) return;
    pickupDragPointerId = null;
    checkPickupMarkerPosition();
}

function movePickupMarkerWithKeyboard(event) {
    const steps = {
        ArrowUp: [0, -4],
        ArrowDown: [0, 4],
        ArrowLeft: [-4, 0],
        ArrowRight: [4, 0]
    };
    const step = steps[event.key];
    if (!step) return;
    event.preventDefault();
    event.stopPropagation();
    setPickupMarkerPosition(pickupMarkerPosition.left + step[0], pickupMarkerPosition.top + step[1]);
    checkPickupMarkerPosition();
}

document.addEventListener('pointermove', movePickupMarker);
document.addEventListener('pointerup', finishPickupDrag);
document.addEventListener('pointercancel', finishPickupDrag);

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

    if (step === 4) {
        resetPickupMarker();
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
    const destinationInput = document.getElementById('sim-destination-input');
    if (destinationInput) destinationInput.value = '';
    updateDestinationSearch();
    resetPickupMarker();
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
