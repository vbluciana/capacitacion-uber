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



    if (viewId === 'view-simulador') {

        if (!simStartTime) simStartTime = Date.now();

    }



    // Actualizar estilo en la barra de navegación

    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {

        item.classList.remove('active');

    });

    if (navElement) {

        navElement.classList.add('active');

        if (typeof navElement.scrollIntoView === 'function') {

            navElement.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });

        }

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

        toggleAccessibilityMenu(false);

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

        if (typeof simPaymentSheetOpen === 'function' && simPaymentSheetOpen()) {
            closePaymentSheet();
        }
        document.querySelectorAll('.sim-modal-overlay').forEach(overlay => {
            if (overlay.style.display === 'flex' || overlay.style.display === 'block') {
                overlay.style.display = 'none';
            }
        });

    }

});



// Funciones para el modal de Canva (reutilizable)

let currentCanvaGuideUrl = '';

let currentCanvaDemoUrl = '';

let currentCanvaDemoAudioUrl = '';
let currentCanvaDemoAudioTitle = '';
let currentModuleId = null;
const moduleProgressStorageKey = 'uberTrainingCompletedModules';

const moduleDefinitions = {

    1: {

        title: 'Módulo 1: Registro e Inicio de Sesión',

        guideUrl: 'https://www.canva.com/design/DAHX8hIW2g4/s2kbGXi2XHgoSO36PWaQPw/view?embed',

        demoUrl: 'assets/videos/VIdeoFinal-iniciosesion-Uber.mp4'

    },

    2: {

        title: 'Módulo 2: Solicitud de Viajes',

        guideUrl: 'https://www.canva.com/design/DAHX8iPiL44/hhPkYl3F4QvCrri1YWeSeA/view?embed',
        demoAudioUrl: 'assets/audio/podcast_modulo_2.mp3',
        demoAudioTitle: 'Solicitud de viajes'
    },

    3: {

        title: 'Módulo 3: Gestión de Pagos',

        guideUrl: 'https://www.canva.com/design/DAHYNePtU_U/dTA5TuNUEqcU6PL-BhUozg/view?embed',
        demoAudioUrl: 'assets/audio/podcast_modulo_3.mp3?v=2',
        demoAudioTitle: 'Gestión de pagos'
    },
    4: {
        title: 'Módulo 4: Gestión de Imprevistos y Soporte',
        guideUrl: 'https://www.canva.com/design/DAHYwxFbfEc/sgddke-4jicx80EQ2ztUJg/view?embed',
        demoUrl: 'assets/videos/Video-Gestion-Imprevistos-Uber.MP4'
    }
};
const totalModules = Object.keys(moduleDefinitions).length;
let completedModules = loadCompletedModules();


function loadCompletedModules() {

    try {

        const savedModules = JSON.parse(localStorage.getItem(moduleProgressStorageKey) || '[]');

        return new Set(Array.isArray(savedModules) ? savedModules.filter(id => Number.isInteger(id) && id >= 1 && id <= totalModules) : []);
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

    const lockMessage = document.getElementById('module-lock-message');
    const nextLockedModule = Array.from({ length: totalModules - 1 }, (_, index) => index + 2)
        .find(moduleId => !completedModules.has(moduleId - 1));

    if (progressText) progressText.textContent = `${completedCount} de ${totalModules} módulos completados`;
    if (progressPercent) progressPercent.textContent = `${Math.round(completedCount / totalModules * 100)}%`;
    if (progressTrack) progressTrack.setAttribute('aria-valuemax', String(totalModules));
    if (progressTrack) progressTrack.setAttribute('aria-valuenow', String(completedCount));

    if (progressFill) progressFill.style.width = `${completedCount / totalModules * 100}%`;
    document.querySelectorAll('.module-card[data-module-id]').forEach(card => {
        const moduleId = Number(card.dataset.moduleId);
        const button = card.querySelector('button');
        if (button) button.disabled = moduleId > 1 && !completedModules.has(moduleId - 1);
    });
    if (lockMessage) {
        lockMessage.style.display = nextLockedModule ? 'block' : 'none';
        if (nextLockedModule) {
            lockMessage.textContent = `Complete la actividad del Módulo ${nextLockedModule - 1} para desbloquear el Módulo ${nextLockedModule}.`;
        }
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

    if (!moduleDefinitions[moduleId] || (moduleId > 1 && !completedModules.has(moduleId - 1))) return;
    currentModuleId = moduleId;

    const module = moduleDefinitions[moduleId];
    openCanvaModal(module.guideUrl, module.title, module.demoUrl, moduleId, module.demoAudioUrl, module.demoAudioTitle);
}


function openEncuestaForCurrentModule() {

    if (currentModuleId !== 4) return;


    const encuesta = document.getElementById('modal-encuesta');

    if (!encuesta) return;



    const formIframe = document.getElementById('google-form-iframe');

    if (formIframe && !formIframe.src) {

        formIframe.src = formIframe.dataset.src;

    }

    encuesta.style.display = 'block';

    document.body.style.overflow = 'hidden';

}



function openCanvaModal(url, title, demoUrl, moduleId, demoAudioUrl, demoAudioTitle) {
    const modal = document.getElementById('modal-canva');

    const iframe = document.getElementById('canva-iframe');

    const heading = document.getElementById('canva-modal-title') || (modal ? modal.querySelector('h2') : null);

    if (modal && iframe) {

        modal.classList.remove('side-by-side');

        document.getElementById('modal-actividad')?.classList.remove('side-by-side');

        if (heading && title) heading.textContent = title;

        currentCanvaGuideUrl = url;

        currentCanvaDemoUrl = demoUrl || '';

        currentCanvaDemoAudioUrl = demoAudioUrl || '';
        currentCanvaDemoAudioTitle = demoAudioTitle || '';
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

    const demoVideo = document.getElementById('demo-video');

    const demoAudioPlayer = document.getElementById('demo-audio-player');
    const demoAudio = document.getElementById('demo-audio');
    const demoAudioTitle = demoAudioPlayer ? demoAudioPlayer.querySelector('h3') : null;
    const demoUnavailable = document.getElementById('demo-unavailable');
    const guideButton = document.getElementById('btn-modal-guide');

    const demoButton = document.getElementById('btn-modal-demo');

    const showGuide = view === 'guide';

    const showDemoVideo = !showGuide && Boolean(currentCanvaDemoUrl);

    const isLocalMp4Video = showDemoVideo && /\.(mp4|webm|ogg)(\?.*)?$/i.test(currentCanvaDemoUrl);

    const showDemoIframe = showDemoVideo && !isLocalMp4Video;

    const showDemoAudio = !showGuide && Boolean(currentCanvaDemoAudioUrl);

    if (canvaWrapper) canvaWrapper.style.display = showGuide ? 'block' : 'none';
    if (demoWrapper) demoWrapper.style.display = showGuide ? 'none' : 'flex';
    if (demoWrapper) demoWrapper.classList.toggle('audio-demo', showDemoAudio);
    if (canvaIframe) canvaIframe.src = showGuide ? currentCanvaGuideUrl : '';
    if (demoIframe) {
        demoIframe.src = showDemoIframe ? currentCanvaDemoUrl : '';
        demoIframe.style.display = showDemoIframe ? 'block' : 'none';
    }
    if (demoVideo) {
        if (isLocalMp4Video) {
            if (demoVideo.getAttribute('src') !== currentCanvaDemoUrl) {
                demoVideo.src = currentCanvaDemoUrl;
            }
            demoVideo.style.display = 'block';
        } else {
            demoVideo.pause();
            demoVideo.style.display = 'none';
        }
    }
    if (demoAudioPlayer) demoAudioPlayer.style.display = showDemoAudio ? 'block' : 'none';
    if (demoAudioTitle) demoAudioTitle.textContent = currentCanvaDemoAudioTitle;
    if (demoAudio) {
        demoAudio.setAttribute('aria-label', `Podcast: ${currentCanvaDemoAudioTitle}`);
        if (showDemoAudio) {
            if (demoAudio.getAttribute('src') !== currentCanvaDemoAudioUrl) {
                demoAudio.src = currentCanvaDemoAudioUrl;
            }
        } else {
            demoAudio.pause();
        }
    }
    if (demoUnavailable) demoUnavailable.style.display = !showGuide && !showDemoVideo && !showDemoAudio ? 'block' : 'none';
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

    const demoVideo = document.getElementById('demo-video');

    const demoAudio = document.getElementById('demo-audio');
    if (canvaIframe) canvaIframe.src = '';
    if (demoIframe) demoIframe.src = '';
    if (demoVideo) {
        demoVideo.pause();
        demoVideo.currentTime = 0;
        demoVideo.removeAttribute('src');
        demoVideo.load();
    }
    if (demoAudio) {
        demoAudio.pause();
        demoAudio.currentTime = 0;
        demoAudio.removeAttribute('src');
        demoAudio.load();
    }
}


function closeCanvaModal() {

    const modal = document.getElementById('modal-canva');

    if (modal) {
        modal.style.display = 'none';
    }
    modal?.classList.remove('side-by-side');
    document.body.style.overflow = 'auto';
    stopCanvaModalMedia();
}

function volverAPresentacion() {
    const modal = document.getElementById('modal-canva');
    const activityModal = document.getElementById('modal-actividad');
    if (!modal || !activityModal) return;

    activityModal.style.display = 'none';
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    const demoButton = document.getElementById('btn-modal-demo');
    switchCanvaModalView(demoButton?.getAttribute('aria-pressed') === 'true' ? 'demo' : 'guide');
}

// La actividad de ordenamiento se realiza después de consultar la guía.
function finalizarCanvaModal() {
    if (currentModuleId >= 1 && currentModuleId <= 4) {
        openActividadModal(currentModuleId);
        return;
    }



    closeCanvaModal();

    if (currentModuleId) completeModule(currentModuleId);

    currentModuleId = null;

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



// --- SISTEMA INTEGRAL DE PREFERENCIAS VISUALES E INCLUSIVAS ---
const preferencesStorageKey = 'uberTrainingPreferences';

const defaultPreferences = {
    zoomScale: 1.0,          // 0.8 a 1.4 (pasos de 0.1)
    theme: 'light',          // 'light' | 'dark'
    highContrast: false,     // boolean
    colorblind: 'none',      // 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'achromatopsia'
    dyslexiaFont: false      // boolean
};

let userPreferences = { ...defaultPreferences };

function loadPreferences() {
    try {
        let saved = JSON.parse(localStorage.getItem(preferencesStorageKey) || 'null');
        
        if (!saved) {
            const legacy = JSON.parse(localStorage.getItem('uberTrainingAccessibility') || '{}');
            saved = {
                zoomScale: legacy.fontScale === 1.2 ? 1.2 : 1.0,
                highContrast: Boolean(legacy.highContrast)
            };
        }

        userPreferences = {
            zoomScale: (typeof saved.zoomScale === 'number' && saved.zoomScale >= 0.75 && saved.zoomScale <= 1.45) ? Math.round(saved.zoomScale * 10) / 10 : defaultPreferences.zoomScale,
            theme: (saved.theme === 'dark') ? 'dark' : 'light',
            highContrast: Boolean(saved.highContrast),
            colorblind: ['protanopia', 'deuteranopia', 'tritanopia', 'achromatopsia'].includes(saved.colorblind) ? saved.colorblind : 'none',
            dyslexiaFont: Boolean(saved.dyslexiaFont)
        };
    } catch (e) {
        userPreferences = { ...defaultPreferences };
    }
}

function savePreferences() {
    try {
        localStorage.setItem(preferencesStorageKey, JSON.stringify(userPreferences));
        localStorage.setItem('uberTrainingAccessibility', JSON.stringify({
            fontScale: userPreferences.zoomScale,
            highContrast: userPreferences.highContrast
        }));
    } catch (e) {}
}

function applyPreferences() {
    const root = document.documentElement;
    const body = document.body;

    // 1. Zoom / Tamaño de letra general
    root.style.setProperty('--accessibility-font-scale', String(userPreferences.zoomScale));
    const zoomIndicator = document.getElementById('a11y-zoom-indicator');
    if (zoomIndicator) {
        zoomIndicator.textContent = `${Math.round(userPreferences.zoomScale * 100)}%`;
    }
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    if (zoomOutBtn) zoomOutBtn.disabled = userPreferences.zoomScale <= 0.8;
    if (zoomInBtn) zoomInBtn.disabled = userPreferences.zoomScale >= 1.4;

    // 2. Tema Claro / Oscuro
    const isDark = userPreferences.theme === 'dark';
    body.classList.toggle('dark-mode', isDark);
    const lightBtn = document.getElementById('theme-light-btn');
    const darkBtn = document.getElementById('theme-dark-btn');
    if (lightBtn && darkBtn) {
        lightBtn.classList.toggle('active', !isDark);
        lightBtn.setAttribute('aria-pressed', String(!isDark));
        darkBtn.classList.toggle('active', isDark);
        darkBtn.setAttribute('aria-pressed', String(isDark));
    }

    // 3. Alto Contraste
    body.classList.toggle('high-contrast', userPreferences.highContrast);
    const contrastBtn = document.getElementById('toggle-contrast');
    if (contrastBtn) {
        contrastBtn.setAttribute('aria-pressed', String(userPreferences.highContrast));
        contrastBtn.setAttribute('aria-label', userPreferences.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste');
    }

    // 4. Modos para Daltonismo
    const colorblindClasses = ['colorblind-protanopia', 'colorblind-deuteranopia', 'colorblind-tritanopia', 'colorblind-achromatopsia'];
    colorblindClasses.forEach(cls => body.classList.remove(cls));
    if (userPreferences.colorblind !== 'none') {
        body.classList.add(`colorblind-${userPreferences.colorblind}`);
    }
    const colorblindSelect = document.getElementById('colorblind-select');
    if (colorblindSelect && colorblindSelect.value !== userPreferences.colorblind) {
        colorblindSelect.value = userPreferences.colorblind;
    }

    // 5. Tipografía para Dislexia
    body.classList.toggle('dyslexia-font', userPreferences.dyslexiaFont);
    const dyslexiaBtn = document.getElementById('toggle-dyslexia');
    if (dyslexiaBtn) dyslexiaBtn.setAttribute('aria-pressed', String(userPreferences.dyslexiaFont));

    // Botón principal de Preferencias
    const toggleButton = document.getElementById('accessibility-toggle');
    if (toggleButton) {
        const isOpen = toggleButton.getAttribute('aria-expanded') === 'true';
        toggleButton.setAttribute('aria-label', isOpen ? 'Cerrar menú de preferencias' : 'Abrir menú de preferencias');
    }
}

function changeZoom(delta) {
    let next = Math.round((userPreferences.zoomScale + delta) * 10) / 10;
    if (next < 0.8) next = 0.8;
    if (next > 1.4) next = 1.4;
    userPreferences.zoomScale = next;
    savePreferences();
    applyPreferences();
}

function resetZoom() {
    userPreferences.zoomScale = 1.0;
    savePreferences();
    applyPreferences();
}

function setTheme(themeName) {
    userPreferences.theme = themeName === 'dark' ? 'dark' : 'light';
    savePreferences();
    applyPreferences();
}

function toggleHighContrast() {
    userPreferences.highContrast = !userPreferences.highContrast;
    savePreferences();
    applyPreferences();
}

function setColorblindMode(mode) {
    userPreferences.colorblind = mode;
    savePreferences();
    applyPreferences();
}

function toggleDyslexiaFont() {
    userPreferences.dyslexiaFont = !userPreferences.dyslexiaFont;
    savePreferences();
    applyPreferences();
}

function resetPreferences() {
    userPreferences = { ...defaultPreferences };
    savePreferences();
    applyPreferences();
}

function toggleAccessibilityMenu(forceState) {
    const toggleButton = document.getElementById('accessibility-toggle');
    const menu = document.getElementById('accessibility-menu');
    if (!toggleButton || !menu) return;

    const isCurrentlyOpen = toggleButton.getAttribute('aria-expanded') === 'true';
    const shouldOpen = typeof forceState === 'boolean' ? forceState : !isCurrentlyOpen;

    toggleButton.setAttribute('aria-expanded', String(shouldOpen));
    toggleButton.setAttribute('aria-label', shouldOpen ? 'Cerrar menú de preferencias' : 'Abrir menú de preferencias');

    menu.hidden = !shouldOpen;
    menu.classList.toggle('active', shouldOpen);
}

// Modal del Plan de Capacitación
function openPlanModal() {
    openModal('modal-plan-pdf');
}

function initializeAccessibilityControls() {
    const toggleButton = document.getElementById('accessibility-toggle');
    const menu = document.getElementById('accessibility-menu');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const themeLightBtn = document.getElementById('theme-light-btn');
    const themeDarkBtn = document.getElementById('theme-dark-btn');
    const contrastButton = document.getElementById('toggle-contrast');
    const colorblindSelect = document.getElementById('colorblind-select');
    const dyslexiaBtn = document.getElementById('toggle-dyslexia');
    const resetButton = document.getElementById('reset-accessibility');

    loadPreferences();
    applyPreferences();

    if (menu) {
        menu.hidden = true;
        menu.classList.remove('active');
    }
    if (toggleButton) {
        toggleButton.setAttribute('aria-expanded', 'false');
        toggleButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleAccessibilityMenu();
        });
    }

    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeZoom(-0.1);
        });
    }
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            changeZoom(0.1);
        });
    }
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            resetZoom();
        });
    }

    if (themeLightBtn) {
        themeLightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setTheme('light');
        });
    }
    if (themeDarkBtn) {
        themeDarkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            setTheme('dark');
        });
    }

    if (contrastButton) {
        contrastButton.addEventListener('click', (event) => {
            event.stopPropagation();
            toggleHighContrast();
        });
    }

    if (colorblindSelect) {
        colorblindSelect.addEventListener('change', (e) => {
            setColorblindMode(e.target.value);
        });
        colorblindSelect.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    if (dyslexiaBtn) {
        dyslexiaBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDyslexiaFont();
        });
    }

    if (resetButton) {
        resetButton.addEventListener('click', (event) => {
            event.stopPropagation();
            resetPreferences();
        });
    }

    if (menu) {
        menu.addEventListener('click', (event) => {
            event.stopPropagation();
        });
    }

    // Cerrar menú al hacer clic afuera
    document.addEventListener('click', (event) => {
        const target = event.target;
        if (!menu || !toggleButton) return;
        if (!menu.contains(target) && !toggleButton.contains(target)) {
            toggleAccessibilityMenu(false);
        }
    });

    // Cerrar con tecla Escape
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && menu && !menu.hidden) {
            toggleAccessibilityMenu(false);
            if (toggleButton) toggleButton.focus();
        }
    });
}
if (document.readyState === 'loading') {

    document.addEventListener('DOMContentLoaded', () => {

        updateModulesProgress();

        initializeAccessibilityControls();

    });

} else {

    updateModulesProgress();

    initializeAccessibilityControls();

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
// ========================================================
// LÓGICA DEL SIMULADOR PRÁCTICO INTERACTIVO (MODO CLARO UBER - CÓRDOBA CAPITAL - 50+)
// ========================================================

const SIM_FIXED_ORIGIN = 'Av. Colón 1450, Barrio Alberdi';
const SIM_FIXED_DESTINATION = 'Hospital Privado Universitario (Av. Naciones Unidas 346)';

const simStepData = {
    1: {
        title: "Paso 1: Abrir el buscador",
        desc: "En la pantalla del celular, toque la barra gris que dice <strong>\"¿A dónde vas?\"</strong> (resaltada con borde azul).",
        progress: 16.6
    },
    2: {
        title: "Paso 2: Ingresar el origen y el destino",
        desc: "Verifique que el origen sea <strong>Av. Colón 1450</strong> y escriba <strong>Hospital Privado</strong> en el destino (o toque directamente la opción <strong>Hospital Privado Universitario</strong> que aparece debajo).",
        progress: 33.3
    },
    3: {
        title: "Paso 3: Elegir el auto y confirmar",
        desc: "Elija el tipo de auto (ej. <strong>Essential</strong> por <strong>$ 3.200</strong>) y luego toque el botón negro <strong>\"Elegir Essential ($ 3.200)\"</strong> que está fijo abajo.",
        progress: 50
    },
    4: {
        title: "Paso 4: Confirmar punto de partida",
        desc: "En el mapa, arrastre el puntero hasta hacerlo coincidir con el punto azul sobre <strong>Av. Colón 1450</strong> (o toque el botón <strong>⌖</strong>) y luego presione <strong>\"Confirmar punto de partida\"</strong>.",
        progress: 66.6
    },
    5: {
        title: "Paso 5: Revisar los datos del chofer",
        desc: "Verifique la patente <strong>AE 842 KQ</strong>, el auto <strong>Fiat Cronos</strong> y al chofer <strong>Carlos Alberto Pereyra</strong>. Luego toque <strong>\"Subir al auto e iniciar el viaje\"</strong>.",
        progress: 83.3
    },
    6: {
        title: "Paso 6: Llegar al Hospital Privado",
        desc: "Siga el recorrido en el mapa de Córdoba y presione el botón negro <strong>\"Llegar a destino y calificar viaje\"</strong> para finalizar.",
        progress: 100
    }
};

const simCarCatalog = {
    uberx: {
        name: "Essential",
        buttonLabel: "Elegir Essential",
        price: "$ 3.200",
        model: "Fiat Cronos Gris Plata"
    },
    comfort: {
        name: "Comfort",
        buttonLabel: "Elegir Comfort",
        price: "$ 3.900",
        model: "Toyota Corolla Gris Plata"
    },
    women: {
        name: "Uber Mujeres",
        buttonLabel: "Elegir Uber Mujeres",
        price: "$ 3.200",
        model: "Volkswagen Polo Gris Plata"
    }
};

let currentSimStep = 1;
let simSelectedCar = 'uberx';
let simSelectedPayment = 'cash';
let simSelectedPaymentLabel = 'Efectivo';
let simOriginAddress = SIM_FIXED_ORIGIN;
let simDestinationAddress = SIM_FIXED_DESTINATION;
let simLastValidDestText = '';
let simErrorTimeout = null;
let pickupDragPointerId = null;
let pickupPanStart = { x: 0, y: 0 };
let pickupMapOffset = { x: 0, y: 0 };
let simErrorsCount = 0;
let simStartTime = null;
let simCompleted = false;
let simResultSaved = false;
let simWasPickupCentered = false;
let simCurrentRating = 5;

// --- Asistente de Voz / Lectura en Voz Alta (Text-to-Speech) ---
function toggleSimSpeech() {
    if (!('speechSynthesis' in window)) {
        alert('La síntesis de voz no está disponible en su navegador web.');
        return;
    }
    if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateTtsButtonState(false);
        return;
    }
    speakSimInstruction();
}

function speakSimInstruction() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const data = simStepData[currentSimStep];
    if (!data) return;

    const tmp = document.createElement('div');
    tmp.innerHTML = data.desc;
    const cleanDesc = tmp.textContent || tmp.innerText || '';

    const textToSpeak = `${data.title}. ${cleanDesc}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = 'es-AR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    utterance.onstart = () => updateTtsButtonState(true);
    utterance.onend = () => updateTtsButtonState(false);
    utterance.onerror = () => updateTtsButtonState(false);

    window.speechSynthesis.speak(utterance);
}

function updateTtsButtonState(isSpeaking) {
    const btn = document.getElementById('btn-sim-tts');
    const label = document.getElementById('sim-tts-label');
    if (btn) {
        if (isSpeaking) {
            btn.classList.add('tts-active');
            if (label) label.textContent = 'Pausar voz';
        } else {
            btn.classList.remove('tts-active');
            if (label) label.textContent = 'Escuchar instrucción';
        }
    }
}

// Sincronizar etiquetas de origen, destino, auto, precio y pago en todas las pantallas
function syncSimTripLabels() {
    const carInfo = simCarCatalog[simSelectedCar] || simCarCatalog.uberx;

    const homeOrigin = document.getElementById('sim-home-origin-label');
    if (homeOrigin) homeOrigin.textContent = 'Av. Colón 1450, Alberdi';

    const mapRouteSummary = document.getElementById('sim-map-route-summary');
    if (mapRouteSummary) mapRouteSummary.textContent = 'Av. Colón 1450 ➔ Hospital Privado';

    const pickupAddrLabel = document.getElementById('sim-pickup-address-label');
    if (pickupAddrLabel) pickupAddrLabel.textContent = 'Av. Colón 1450, Barrio Alberdi (Frente a su puerta)';

    const assignedModel = document.getElementById('sim-assigned-car-model');
    if (assignedModel) assignedModel.textContent = carInfo.model;

    const checkCarModel = document.getElementById('sim-check-car-model');
    if (checkCarModel) checkCarModel.textContent = carInfo.model.split(' ').slice(0, 2).join(' ');

    const intripCarLine = document.getElementById('sim-intrip-car-line');
    if (intripCarLine) intripCarLine.textContent = `${carInfo.model} · AE 842 KQ`;

    const detailDest = document.getElementById('sim-detail-dest');
    if (detailDest) detailDest.textContent = 'Destino: Hospital Privado (Av. Naciones Unidas 346)';

    const detailPricePay = document.getElementById('sim-detail-price-pay');
    if (detailPricePay) detailPricePay.textContent = `Tarifa fija: ${carInfo.price} · ${simSelectedPaymentLabel}`;

    const intripDestLine = document.getElementById('sim-intrip-dest-line');
    if (intripDestLine) intripDestLine.textContent = 'Av. Colón 1450 ➔ Hospital Privado';

    const finalPayMethod = document.getElementById('sim-final-pay-method');
    if (finalPayMethod) finalPayMethod.textContent = simSelectedPaymentLabel;

    const finalPriceAmount = document.getElementById('sim-final-price-amount');
    if (finalPriceAmount) finalPriceAmount.textContent = carInfo.price;
}

// Seleccionar el destino fijo del ejercicio (Hospital Privado) y coincidir con el mapa
function selectFixedTripDestination(event, skipInputCheck) {
    if (event) event.stopPropagation();
    const originInput = document.getElementById('sim-origin-input');
    const destInput = document.getElementById('sim-destination-input');

    // Si el usuario escribió en el campo de destino, validar que coincida exactamente con Hospital Privado / Hospital Privado Universitario
    if (!skipInputCheck && destInput && destInput.value.trim() !== '') {
        const error = validateSimDestinationText(destInput.value);
        if (error) {
            destInput.classList.add('input-error');
            const prompt = document.getElementById('sim-destination-prompt');
            if (prompt) {
                prompt.textContent = error;
                prompt.classList.remove('prompt-ok');
                prompt.classList.add('prompt-error');
            }
            triggerPhoneError(error);
            return;
        }
    }

    if (originInput) originInput.value = 'Av. Colón 1450, Barrio Alberdi';
    if (destInput) {
        destInput.value = 'Hospital Privado Universitario';
        destInput.classList.remove('input-error');
    }
    simOriginAddress = SIM_FIXED_ORIGIN;
    simDestinationAddress = SIM_FIXED_DESTINATION;
    simLastValidDestText = 'Hospital Privado Universitario';
    clearPhoneError();
    syncSimTripLabels();
    simTriggerStep(3, event);
}

// Compatibilidad por si se llama selectQuickDestination
function selectQuickDestination(destName, event) {
    selectFixedTripDestination(event);
}

// Checklist interactivo de seguridad (Paso 5)
function updateBoardCarButtonState() {
    const checks = document.querySelectorAll('#sim-screen-5 .sim-check-item');
    const done = document.querySelectorAll('#sim-screen-5 .sim-check-item.checked');
    const allChecked = checks.length > 0 && done.length >= checks.length;
    const btn = document.getElementById('sim-board-car-btn');
    if (btn) {
        btn.setAttribute('aria-disabled', allChecked ? 'false' : 'true');
        btn.classList.toggle('sim-highlight-pulse', allChecked);
    }
}

function toggleSafetyCheck(el, event) {
    if (event) event.stopPropagation();
    const isChecked = el.classList.toggle('checked');
    el.setAttribute('aria-checked', isChecked ? 'true' : 'false');
    updateBoardCarButtonState();
    clearPhoneError();
}

// Sub-vistas del Paso 6 (En viaje -> Califica tu viaje)
function showSimRatingSubscreen(event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    const inTripView = document.getElementById('sim-subscreen-intrip');
    const ratingView = document.getElementById('sim-subscreen-rating');
    if (inTripView) inTripView.style.display = 'none';
    if (ratingView) ratingView.style.display = 'flex';

    const titleEl = document.getElementById('sim-guide-title');
    const descEl = document.getElementById('sim-guide-desc');
    if (titleEl) titleEl.textContent = 'Paso 6: Calificar y finalizar';
    if (descEl) {
        descEl.innerHTML = '¡Llegó al <strong>Hospital Privado</strong>! Toque las estrellas para calificar el viaje o toque <strong>"Omitir"</strong> para abrir su certificado y finalizar.';
    }
}

function backToSimInTrip(event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    const inTripView = document.getElementById('sim-subscreen-intrip');
    const ratingView = document.getElementById('sim-subscreen-rating');
    if (inTripView) inTripView.style.display = 'flex';
    if (ratingView) ratingView.style.display = 'none';
    const titleEl = document.getElementById('sim-guide-title');
    const descEl = document.getElementById('sim-guide-desc');
    if (titleEl) titleEl.textContent = simStepData[6].title;
    if (descEl) descEl.innerHTML = simStepData[6].desc;
}

let simRatingGiven = 0;
let simSkippedRating = false;
let simCertTimer = null;

function rateSimTrip(stars, event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    simCurrentRating = stars;
    simRatingGiven = stars;
    simSkippedRating = false;
    document.querySelectorAll('.uber-star-btn').forEach((btn, idx) => {
        btn.classList.toggle('active', idx < stars);
        btn.classList.remove('sim-highlight-pulse');
    });
    const feedback = document.getElementById('sim-rating-feedback-text');
    if (feedback) {
        const messages = {
            5: '¡Excelente servicio de Carlos Alberto! (5 estrellas ★)',
            4: 'Muy buen viaje (4 estrellas ★)',
            3: 'Viaje correcto (3 estrellas ★)',
            2: 'Podría mejorar (2 estrellas ★)',
            1: 'Tuve un inconveniente (1 estrella ★)'
        };
        feedback.textContent = messages[stars] || '';
    }
    // Calificar finaliza la simulación y abre el certificado de práctica de inmediato
    if (simCertTimer) {
        clearTimeout(simCertTimer);
        simCertTimer = null;
    }
    finishSimulation(false);
}

function skipSimRating(event) {
    if (event) event.stopPropagation();
    if (simCertTimer) {
        clearTimeout(simCertTimer);
        simCertTimer = null;
    }
    simRatingGiven = 0;
    simCurrentRating = 0;
    simSkippedRating = true;
    document.querySelectorAll('.uber-star-btn').forEach(btn => {
        btn.classList.remove('active', 'sim-highlight-pulse');
    });
    const feedback = document.getElementById('sim-rating-feedback-text');
    if (feedback) {
        feedback.textContent = 'Calificación omitida';
    }
    finishSimulation(true);
}

function finishSimulation(skipped) {
    if (currentSimStep !== 6) return;
    if (simCertTimer) {
        clearTimeout(simCertTimer);
        simCertTimer = null;
    }
    clearPhoneError();
    simSkippedRating = Boolean(skipped);
    simCompleted = true;

    if (!simResultSaved) {
        simResultSaved = true;
        const tiempoSeg = Math.round((Date.now() - (simStartTime || Date.now())) / 1000);
        if (typeof guardarResultadoSimulador === 'function') {
            guardarResultadoSimulador(simErrorsCount, tiempoSeg);
        }
    }

    const ratingLine = document.getElementById('sim-cert-rating');
    if (ratingLine) {
        ratingLine.textContent = skipped || !simRatingGiven
            ? 'Calificación del viaje: omitida'
            : 'Calificación del viaje: ' + '★'.repeat(simRatingGiven) + '☆'.repeat(5 - simRatingGiven) + ' (' + simRatingGiven + ' de 5)';
    }
    const card = document.getElementById('sim-success-card');
    if (card) card.style.display = 'block';

    const dot6 = document.getElementById('sim-step-dot-6');
    if (dot6) dot6.classList.add('completed');

    const titleEl = document.getElementById('sim-guide-title');
    const descEl = document.getElementById('sim-guide-desc');
    if (titleEl) titleEl.textContent = '¡Práctica completada!';
    if (descEl) {
        descEl.innerHTML = 'Completó todo el recorrido y obtuvo su <strong>Certificado de Práctica</strong>. Puede volver a abrirlo o presionar <strong>"Reiniciar"</strong> para practicar otra vez.';
    }

    openSimCertificateModal();
}

function resetSimRating() {
    if (simCertTimer) {
        clearTimeout(simCertTimer);
        simCertTimer = null;
    }
    simRatingGiven = 0;
    simSkippedRating = false;
    simCurrentRating = 0;
    document.querySelectorAll('.uber-star-btn').forEach((btn, idx) => {
        btn.classList.remove('active');
        btn.classList.toggle('sim-highlight-pulse', idx === 4);
    });
    const feedback = document.getElementById('sim-rating-feedback-text');
    if (feedback) feedback.textContent = 'Toque las estrellas para calificar el viaje (o toque Omitir)';
    const card = document.getElementById('sim-success-card');
    if (card) card.style.display = 'none';
    const ratingLine = document.getElementById('sim-cert-rating');
    if (ratingLine) ratingLine.textContent = '';
}

// Modales didácticos simulados
function openSimShareModal(event) {
    if (event) event.stopPropagation();
    syncSimTripLabels();
    const modal = document.getElementById('sim-modal-share');
    if (modal) modal.style.display = 'flex';
}

function closeSimShareModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-share');
    if (modal) modal.style.display = 'none';
}

function openSimCallModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-call');
    if (modal) modal.style.display = 'flex';
}

function closeSimCallModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-call');
    if (modal) modal.style.display = 'none';
}

function openSimChatModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-chat');
    if (modal) modal.style.display = 'flex';
}

function closeSimChatModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-chat');
    if (modal) modal.style.display = 'none';
}

function sendSimQuickChat(msgText) {
    const userReply = document.getElementById('sim-chat-user-reply');
    if (userReply) {
        userReply.style.display = 'block';
        userReply.innerHTML = `<strong>Usted:</strong> ${escapeHtml(msgText)}`;
    }
}

function openSimSecurityModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-security');
    if (modal) modal.style.display = 'flex';
}

function closeSimSecurityModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-security');
    if (modal) modal.style.display = 'none';
}

function openSimCertificateModal(event) {
    if (event && event.stopPropagation) event.stopPropagation();
    const modal = document.getElementById('sim-modal-certificate');
    if (modal) modal.style.display = 'flex';
}

function closeSimCertificateModal(event) {
    if (event) event.stopPropagation();
    const modal = document.getElementById('sim-modal-certificate');
    if (modal) modal.style.display = 'none';
}

// Actualización de búsqueda al escribir el destino fijo
function updateDestinationSearch() {
    const input = document.getElementById('sim-destination-input');
    const result = document.getElementById('sim-destination-result');
    const prompt = document.getElementById('sim-destination-prompt');
    const card = document.getElementById('sim-destination-confirm-card');
    const placeRow = document.querySelector('#sim-screen-2 .uber-place-row');
    if (!input) return;

    const rawValue = input.value;
    const trimmed = rawValue.trim();

    if (!trimmed) {
        simLastValidDestText = '';
        input.classList.remove('input-error');
        if (result) result.textContent = 'Confirmar destino escrito';
        if (prompt) {
            prompt.textContent = 'Escriba "Hospital Privado" arriba y luego toque aquí';
            prompt.classList.remove('prompt-error', 'prompt-ok');
        }
        if (card) card.classList.remove('sim-highlight-pulse');
        if (placeRow) placeRow.classList.add('sim-highlight-pulse');
        return;
    }

    const normalized = normalizeSimText(rawValue);
    const targetFull = 'hospital privado universitario';
    const isPrefix = targetFull.startsWith(normalized);

    if (!isPrefix) {
        const errorMsg = validateSimDestinationText(rawValue);
        input.classList.add('input-error');
        if (result) result.textContent = '❌ Dirección no válida para esta práctica';
        if (prompt) {
            prompt.textContent = errorMsg;
            prompt.classList.add('prompt-error');
            prompt.classList.remove('prompt-ok');
        }
        if (card) card.classList.remove('sim-highlight-pulse');
        if (placeRow) placeRow.classList.remove('sim-highlight-pulse');
        triggerPhoneError(errorMsg);
        return;
    }

    simLastValidDestText = rawValue;
    input.classList.remove('input-error');
    if (placeRow) placeRow.classList.add('sim-highlight-pulse');

    const validationError = validateSimDestinationText(trimmed);
    if (!validationError) {
        clearPhoneError();
        if (result) result.textContent = 'Confirmar ruta: Av. Colón 1450 ➔ Hospital Privado';
        if (prompt) {
            prompt.textContent = '✅ Destino correcto. Toque aquí o presione Enter para continuar';
            prompt.classList.add('prompt-ok');
            prompt.classList.remove('prompt-error');
        }
        if (card) card.classList.add('sim-highlight-pulse');
    } else {
        if (result) result.textContent = 'Escribiendo: "' + trimmed + '"';
        if (prompt) {
            prompt.textContent = 'Complete "Hospital Privado" o "Hospital Privado Universitario"';
            prompt.classList.remove('prompt-error', 'prompt-ok');
        }
        if (card) card.classList.remove('sim-highlight-pulse');
    }
}

function normalizeSimText(text) {
    return String(text || '')
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Devuelve null SOLO si el texto es exactamente "Hospital Privado" o "Hospital Privado Universitario"
function validateSimDestinationText(raw) {
    const text = normalizeSimText(raw);
    if (!text) return 'Escriba "Hospital Privado" o toque "Hospital Privado Universitario".';
    if (text === 'hospital privado' || text === 'hospital privado universitario') return null;
    if (/^\d+$/.test(text)) return 'Eso es solo un número. Escriba "Hospital Privado" o "Hospital Privado Universitario".';
    if (text.includes('colon') || text.includes('alberdi') || text === 'casa') {
        return 'Esa es su dirección de origen (Av. Colón 1450). El destino debe ser "Hospital Privado".';
    }
    if (text === 'hospital') return 'Falta precisar qué hospital. Escriba "Hospital Privado" o "Hospital Privado Universitario".';
    if ('hospital privado universitario'.startsWith(text)) {
        return 'Texto incompleto. Escriba "Hospital Privado" o "Hospital Privado Universitario" completo.';
    }
    if (text.length < 3) return 'El texto es muy corto. Escriba "Hospital Privado".';
    const shown = String(raw).trim().slice(0, 30);
    return 'No coincide "' + shown + '". Solo se permite "Hospital Privado" o "Hospital Privado Universitario".';
}

function searchSimulatorDestination(event) {
    if (event) event.stopPropagation();
    const input = document.getElementById('sim-destination-input');
    const prompt = document.getElementById('sim-destination-prompt');
    const error = validateSimDestinationText(input ? input.value : '');
    if (error) {
        if (input) {
            input.classList.add('input-error');
            input.focus();
        }
        if (prompt) {
            prompt.textContent = error;
            prompt.classList.remove('prompt-ok');
            prompt.classList.add('prompt-error');
        }
        triggerPhoneError(error);
        return;
    }
    clearPhoneError();
    selectFixedTripDestination(event, true);
}

function submitDestinationOnEnter(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        searchSimulatorDestination(event);
    }
}

// Coordenadas exactas de Av. Colón 1450 en map_background.svg: 35% X, 50% Y (sobre la traza de AV. COLÓN)
const PICKUP_TARGET_POS = { left: 35, top: 50 };
let pickupMarkerPos = { left: 68, top: 50 };

// Recentrar el puntero en la ubicación GPS actual en Av. Colón 1450 (Botón real ⌖ de Uber en Paso 4)
function recenterPickupMap(event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    pickupMarkerPos = { left: PICKUP_TARGET_POS.left, top: PICKUP_TARGET_POS.top };
    applyPickupMapTransform(true);
}

function applyPickupMapTransform(animate) {
    const marker = document.getElementById('pickup-marker');
    const markerTag = document.getElementById('pickup-marker-tag');
    const addrLabel = document.getElementById('sim-pickup-address-label');
    const subStatus = document.getElementById('sim-pickup-substatus');
    const confirmBtn = document.getElementById('confirm-pickup-btn');
    const recenterBtn = document.getElementById('btn-pickup-recenter');
    const descEl = document.getElementById('sim-guide-desc');

    const dist = Math.hypot(
        pickupMarkerPos.left - PICKUP_TARGET_POS.left,
        pickupMarkerPos.top - PICKUP_TARGET_POS.top
    );
    const isCentered = dist <= 13;

    if (isCentered) {
        pickupMarkerPos = { left: PICKUP_TARGET_POS.left, top: PICKUP_TARGET_POS.top };
    }

    if (marker) {
        marker.style.transition = animate ? 'left 0.22s ease, top 0.22s ease' : 'none';
        marker.style.left = `${pickupMarkerPos.left}%`;
        marker.style.top = `${pickupMarkerPos.top}%`;
    }

    if (isCentered) {
        if (marker) {
            marker.classList.add('pickup-marker-confirmed');
            marker.classList.remove('sim-highlight-pulse');
        }
        if (markerTag) markerTag.textContent = '✓ Av. Colón 1450';
        if (addrLabel) addrLabel.textContent = 'Av. Colón 1450, Barrio Alberdi (Confirmado)';
        if (subStatus) {
            subStatus.innerHTML = '✅ Puntero alineado sobre <strong>Av. Colón 1450</strong>';
            subStatus.style.color = '#15803D';
        }
        if (confirmBtn) {
            confirmBtn.setAttribute('aria-disabled', 'false');
            confirmBtn.classList.add('sim-highlight-pulse');
        }
        if (recenterBtn) {
            recenterBtn.classList.remove('sim-highlight-pulse');
        }
        if (currentSimStep === 4 && descEl && !simWasPickupCentered) {
            descEl.innerHTML = '✅ <strong>¡Excelente! El puntero coincide con Av. Colón 1450.</strong> Ahora toque el botón negro <strong>"Confirmar punto de partida"</strong>.';
        }
        simWasPickupCentered = true;
    } else {
        if (marker) {
            marker.classList.remove('pickup-marker-confirmed');
            marker.classList.add('sim-highlight-pulse');
        }
        if (markerTag) markerTag.textContent = 'Arrastrar a Av. Colón 1450';
        if (addrLabel) addrLabel.textContent = 'Av. Colón 1450, Barrio Alberdi';
        if (subStatus) {
            subStatus.innerHTML = 'Arrastre el puntero hasta el punto azul en <strong>Av. Colón 1450</strong>';
            subStatus.style.color = '#B45309';
        }
        if (confirmBtn) {
            confirmBtn.setAttribute('aria-disabled', 'true');
            confirmBtn.classList.remove('sim-highlight-pulse');
        }
        if (currentSimStep === 4 && descEl && simWasPickupCentered && simStepData[4]) {
            descEl.innerHTML = simStepData[4].desc;
        }
        simWasPickupCentered = false;
    }
}

function resetPickupMarker() {
    pickupDragPointerId = null;
    simWasPickupCentered = false;
    pickupMarkerPos = { left: 68, top: 50 };
    applyPickupMapTransform(false);
}

function updatePickupMarkerFromPointer(clientX, clientY, animate) {
    const map = document.getElementById('pickup-map');
    if (!map) return;
    const rect = map.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    const rawLeft = ((clientX - rect.left) / rect.width) * 100;
    const rawTop = ((clientY - rect.top) / rect.height) * 100;

    pickupMarkerPos = {
        left: Math.max(15, Math.min(85, rawLeft)),
        top: Math.max(22, Math.min(82, rawTop))
    };
    applyPickupMapTransform(Boolean(animate));
}

function startPickupDrag(event) {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    event.stopPropagation();
    pickupDragPointerId = event.pointerId;
    if (event.currentTarget && event.currentTarget.setPointerCapture) {
        event.currentTarget.setPointerCapture(event.pointerId);
    }
}

function startPickupMapPan(event) {
    if (event.target.closest('.uber-floating-back-circle, #btn-pickup-recenter, .uber-streetview-thumb, #pickup-marker')) return;
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    event.preventDefault();
    event.stopPropagation();
    pickupDragPointerId = event.pointerId;
    updatePickupMarkerFromPointer(event.clientX, event.clientY, false);
}

function movePickupMarker(event) {
    if (event.pointerId !== pickupDragPointerId) return;
    event.preventDefault();
    updatePickupMarkerFromPointer(event.clientX, event.clientY, false);
}

function finishPickupDrag(event) {
    if (event.pointerId !== pickupDragPointerId) return;
    pickupDragPointerId = null;
    applyPickupMapTransform(true);
    const dist = Math.hypot(
        pickupMarkerPos.left - PICKUP_TARGET_POS.left,
        pickupMarkerPos.top - PICKUP_TARGET_POS.top
    );
    if (currentSimStep === 4) {
        if (dist > 13) {
            triggerPhoneError('Ese no es el lugar de partida. Acerque el puntero al punto azul de Av. Colón 1450 o toque ⌖.', true);
        } else {
            clearPhoneError();
        }
    }
}

document.addEventListener('pointermove', movePickupMarker);
document.addEventListener('pointerup', finishPickupDrag);
document.addEventListener('pointercancel', finishPickupDrag);

// Manejador de clics fuera de los botones activos
function handlePhoneMisclick(event) {
    if (event.target.closest('.sim-valid-action') || 
        event.target.closest('.sim-screen-back') || 
        event.target.closest('.sim-phone-bottom-sheet') ||
        event.target.closest('.sim-dialog-box')) {
        return;
    }
    triggerPhoneError();
}

function clearPhoneError() {
    if (simErrorTimeout) {
        clearTimeout(simErrorTimeout);
        simErrorTimeout = null;
    }
    const phone = document.getElementById('sim-phone-device');
    const screen = document.querySelector('.phone-screen');
    const errorBadge = document.getElementById('sim-error-badge');
    if (phone) phone.classList.remove('shake-error');
    if (screen) screen.classList.remove('screen-error-flash');
    if (errorBadge) {
        errorBadge.style.display = 'none';
        errorBadge.classList.remove('soft');
    }
}

function triggerPhoneError(message, soft) {
    if (!soft) simErrorsCount++;
    if (!simStartTime) simStartTime = Date.now();

    const phone = document.getElementById('sim-phone-device');
    const screen = document.querySelector('.phone-screen');
    const errorBadge = document.getElementById('sim-error-badge');

    if (phone && !soft) {
        phone.classList.remove('shake-error');
        void phone.offsetWidth;
        phone.classList.add('shake-error');
    }

    if (screen && !soft) {
        screen.classList.remove('screen-error-flash');
        void screen.offsetWidth;
        screen.classList.add('screen-error-flash');
    }

    if (errorBadge) {
        const rule = SIM_STEP_RULES[currentSimStep];
        errorBadge.textContent = (soft ? 'ℹ️ ' : '⚠️ ') + (message || (rule && rule.hint) || 'Toque el botón con borde azul');
        errorBadge.classList.toggle('soft', Boolean(soft));
        errorBadge.style.display = 'block';
    }

    if (simErrorTimeout) clearTimeout(simErrorTimeout);
    simErrorTimeout = setTimeout(() => {
        if (phone) phone.classList.remove('shake-error');
        if (screen) screen.classList.remove('screen-error-flash');
        if (errorBadge) errorBadge.style.display = 'none';
    }, soft ? 2800 : 3400);
}

// Cambio de paso principal (Pasos 1 a 6)
function simTriggerStep(step, event) {
    if (event) event.stopPropagation();

    if (simCertTimer) {
        clearTimeout(simCertTimer);
        simCertTimer = null;
    }
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        updateTtsButtonState(false);
    }

    if (!simStartTime) simStartTime = Date.now();
    clearPhoneError();
    closePaymentSheet();
    currentSimStep = step;
    syncSimTripLabels();

    for (let i = 1; i <= 6; i++) {
        const screen = document.getElementById(`sim-screen-${i}`);
        if (screen) {
            screen.style.display = (i === step) ? 'flex' : 'none';
        }
    }

    if (step === 6) {
        const inTripView = document.getElementById('sim-subscreen-intrip');
        const ratingView = document.getElementById('sim-subscreen-rating');
        if (inTripView) inTripView.style.display = 'flex';
        if (ratingView) ratingView.style.display = 'none';
    }

    for (let s = 1; s <= 6; s++) {
        const dot = document.getElementById(`sim-step-dot-${s}`);
        if (dot) {
            dot.classList.remove('active', 'completed');
            if (s === step) {
                dot.classList.add('active');
            } else if (s < step) {
                dot.classList.add('completed');
            }
        }
    }

    const data = simStepData[step];
    if (data) {
        const progressEl = document.getElementById('sim-progress-fill');
        const titleEl = document.getElementById('sim-guide-title');
        const descEl = document.getElementById('sim-guide-desc');

        if (progressEl) progressEl.style.width = `${data.progress}%`;
        if (titleEl) titleEl.textContent = data.title;
        if (descEl) descEl.innerHTML = data.desc;
    }

    const prevBtn = document.getElementById('btn-sim-prev');
    if (prevBtn) {
        prevBtn.style.display = (step > 1) ? 'inline-block' : 'none';
    }

    if (step === 2) {
        const destinationInput = document.getElementById('sim-destination-input');
        simLastValidDestText = destinationInput ? destinationInput.value : '';
        updateDestinationSearch();
    }

    if (step === 3) {
        updateCarConfirmButton();
    }

    if (step === 4) {
        resetPickupMarker();
    }

    if (step === 5) {
        updateBoardCarButtonState();
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
    simSelectedPaymentLabel = 'Efectivo';
    simOriginAddress = SIM_FIXED_ORIGIN;
    simDestinationAddress = SIM_FIXED_DESTINATION;
    simErrorsCount = 0;
    simStartTime = Date.now();
    simCompleted = false;
    simResultSaved = false;

    document.querySelectorAll('.sim-check-item').forEach(item => {
        item.classList.remove('checked');
        item.setAttribute('aria-checked', 'false');
    });
    updateBoardCarButtonState();
    const userReply = document.getElementById('sim-chat-user-reply');
    if (userReply) userReply.style.display = 'none';

    const originInput = document.getElementById('sim-origin-input');
    if (originInput) originInput.value = 'Av. Colón 1450, Barrio Alberdi';

    const destinationInput = document.getElementById('sim-destination-input');
    if (destinationInput) destinationInput.value = '';
    simLastValidDestText = '';
    updateDestinationSearch();
    resetPickupMarker();
    selectCarOption('uberx');
    choosePayment('cash', '💵', 'Efectivo');
    resetSimRating();
    simTriggerStep(1);
}

function selectCarOption(type, event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    simSelectedCar = simCarCatalog[type] ? type : 'uberx';

    const ids = {
        uberx: 'car-uberx',
        comfort: 'car-comfort',
        women: 'car-women'
    };

    Object.keys(ids).forEach(key => {
        const el = document.getElementById(ids[key]);
        if (el) {
            el.classList.toggle('selected', key === simSelectedCar);
        }
    });

    updateCarConfirmButton();
    syncSimTripLabels();
}

function openPaymentSheet(event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    const sheet = document.getElementById('sim-payment-sheet');
    if (sheet) sheet.style.display = 'block';
}

function closePaymentSheet(event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    const sheet = document.getElementById('sim-payment-sheet');
    if (sheet) sheet.style.display = 'none';
}

function choosePayment(method, icon, text, event) {
    if (event) event.stopPropagation();
    clearPhoneError();
    simSelectedPayment = method;
    simSelectedPaymentLabel = text;

    const iconEl = document.getElementById('sim-current-pay-icon');
    const textEl = document.getElementById('sim-current-pay-text');
    if (iconEl) iconEl.textContent = icon;
    if (textEl) textEl.textContent = text;

    const options = {
        cash: { opt: 'pay-opt-cash', check: 'pay-check-cash' },
        card: { opt: 'pay-opt-card', check: 'pay-check-card' },
        visa: { opt: 'pay-opt-visa', check: 'pay-check-visa' }
    };

    Object.keys(options).forEach(key => {
        const optEl = document.getElementById(options[key].opt);
        const checkEl = document.getElementById(options[key].check);
        const isSelected = (key === method);
        if (optEl) optEl.classList.toggle('selected', isSelected);
        if (checkEl) checkEl.style.display = isSelected ? 'inline-flex' : 'none';
    });

    updateCarConfirmButton();
    syncSimTripLabels();
    closePaymentSheet();
}

function updateCarConfirmButton() {
    const btnConfirm = document.getElementById('sim-choose-car-btn');
    const carInfo = simCarCatalog[simSelectedCar] || simCarCatalog.uberx;
    if (btnConfirm) {
        btnConfirm.textContent = `${carInfo.buttonLabel} (${carInfo.price})`;
    }
}



// ACTIVIDAD: ORDENÁ LOS PASOS (Drag & Drop)

// ========================================================



const TRAINING_RESULTS_KEY = 'uber_training_results';



const actividadData = {

    1: {

        moduloNombre: 'Primeros Pasos',

        instruccion: '¿En qué orden se inicia sesión en la app de Uber?',

        pasos: [

            { id: 1, texto: '📱 Entrar a la app' },

            { id: 2, texto: '🔑 Ingresar con Google' },

            { id: 3, texto: '👤 Seleccionar cuenta' },

            { id: 4, texto: '✅ Aceptar condiciones' }

        ],

        ordenCorrecto: [1, 2, 3, 4]

    },

    2: {

        moduloNombre: 'Pedir un Viaje',

        instruccion: '¿En qué orden se pide un viaje en Uber?',

        pasos: [

            { id: 1, texto: '📱 Abrir la app de Uber' },

            { id: 2, texto: '🔍 Tocar "¿A dónde vas?"' },

            { id: 3, texto: '✏️ Escribir el destino' },

            { id: 4, texto: '💳 Seleccionar medio de pago' },

            { id: 5, texto: '🚗 Elegir el tipo de auto' },

            { id: 6, texto: '✅ Confirmar el viaje' }

        ],

        ordenCorrecto: [1, 2, 3, 4, 5, 6]

    },

    3: {

        moduloNombre: 'Agregar método de pago',

        instruccion: '¿En qué orden se agrega un método de pago a la cuenta de Uber?',

        pasos: [

            { id: 1, texto: '📱 Abrir la aplicación de Uber' },

            { id: 2, texto: '👤 Entrar al apartado “Cuenta”' },

            { id: 3, texto: '👛 Abrir “Billetera” en la aplicación' },

            { id: 4, texto: '➕ Seleccionar “Agregar método de pago”' },

            { id: 5, texto: '💳 Elegir el método de pago preferido' },

            { id: 6, texto: '✏️ Completar los datos de la tarjeta y tocar “Siguiente”' },

            { id: 7, texto: '✅ Verificar que el método aparezca en la lista' }

        ],

        ordenCorrecto: [1, 2, 3, 4, 5, 6, 7]

    },
    4: {
        moduloNombre: 'Manejo de imprevistos',
        instruccion: 'Seleccione cada situación y ordene sus pasos. Debe completar las tres actividades.',
        actividades: {
            compartirViaje: {
                titulo: 'Compartir mi viaje en tiempo real',
                instruccion: 'Ordene los pasos para compartir el estado del viaje con otra persona.',
                pasos: [
                    { id: 1, texto: '🚗 El viaje fue solicitado y aceptado por un conductor' },
                    { id: 2, texto: '⬆️ Deslizar hacia arriba hasta ver “Compartir el estado del viaje”' },
                    { id: 3, texto: '🔗 Tocar “Compartir”' },
                    { id: 4, texto: '📋 Seleccionar “Copiar el enlace para compartir”' },
                    { id: 5, texto: '💬 Abrir WhatsApp, elegir a la persona y enviarle el enlace' }
                ],
                ordenCorrecto: [1, 2, 3, 4, 5]
            },
            objetoPerdido: {
                titulo: 'Encontrar un objeto perdido',
                instruccion: 'Ordene los pasos para comunicarse con el conductor por un objeto olvidado.',
                pasos: [
                    { id: 1, texto: '📱 Seleccionar “Actividad” en el inicio' },
                    { id: 2, texto: '🚗 Seleccionar el viaje en el que perdió el objeto' },
                    { id: 3, texto: '🆘 En “Ayuda y seguridad”, elegir “Encuentra un objeto perdido”' },
                    { id: 4, texto: '📞 Elegir la opción para hablar con el conductor' },
                    { id: 5, texto: '📍 Confirmar si tiene el objeto y coordinar un punto de entrega' }
                ],
                ordenCorrecto: [1, 2, 3, 4, 5]
            },
            cancelarViaje: {
                titulo: 'Cancelar un viaje',
                instruccion: 'Ordene los pasos para cancelar un viaje que está esperando.',
                pasos: [
                    { id: 1, texto: '⋯ Tocar los tres puntos mientras espera el viaje' },
                    { id: 2, texto: '❌ Seleccionar “Cancelar viaje”' },
                    { id: 3, texto: '📝 Seleccionar el motivo de la cancelación' },
                    { id: 4, texto: '✅ Confirmar la cancelación' }
                ],
                ordenCorrecto: [1, 2, 3, 4]
            }
        }
    }
};

let actividadModuloActual = null;
let actividadIntentos = 0;
let actividadStartTime = null;
let actividadDragSrcIndex = null;
let actividadOrdenActual = [];
let actividadSeccionActual = null;
const progresoActividadesModulo4 = Object.fromEntries(
    Object.keys(actividadData[4].actividades).map(key => [key, {
        orden: null,
        intentos: 0,
        completada: false,
        startTime: null
    }])
);


function openActividadModal(moduleId) {
    const data = actividadData[moduleId];

    if (!data) return;



    actividadModuloActual = moduleId;

    actividadIntentos = 0;

    actividadStartTime = Date.now();


    const title = document.getElementById('actividad-title');
    const subtitle = document.getElementById('actividad-subtitle');
    const feedback = document.getElementById('actividad-feedback');
    const attemptCount = document.getElementById('actividad-attempt-count');
    const btnVerificar = document.getElementById('btn-actividad-verificar');
    const sections = document.getElementById('actividad-secciones');
    const exercise = document.getElementById('actividad-ejercicio');
    const sortInstruction = document.getElementById('actividad-sort-instruction');

    if (title) title.textContent = `📋 Módulo ${moduleId}: ¡Antes de continuar!`;
    if (subtitle) subtitle.textContent = data.instruccion;
    if (feedback) { feedback.style.display = 'none'; feedback.className = 'actividad-feedback'; }
    if (attemptCount) attemptCount.textContent = '';
    if (btnVerificar) { btnVerificar.disabled = false; btnVerificar.textContent = '✅ Verificar orden'; }
    if (btnVerificar) btnVerificar.hidden = moduleId === 4;
    actividadSeccionActual = null;

    if (moduleId === 4) {
        if (sections) {
            sections.hidden = false;
            renderActividadSecciones();
        }
        if (exercise) exercise.hidden = true;
        if (sortInstruction) sortInstruction.hidden = true;
    } else {
        actividadOrdenActual = shuffleArray([...data.pasos]);
        if (sections) sections.hidden = true;
        if (exercise) exercise.hidden = false;
        if (sortInstruction) sortInstruction.hidden = false;
        renderActividadList();
    }

    const modal = document.getElementById('modal-actividad');
    if (modal) {
        const canvaModal = document.getElementById('modal-canva');
        if (canvaModal) {
            canvaModal.style.display = 'none';
        }
        stopCanvaModalMedia();
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

}


function renderActividadSecciones() {
    const sections = document.getElementById('actividad-secciones');
    const exercise = document.getElementById('actividad-ejercicio');
    const btnVerificar = document.getElementById('btn-actividad-verificar');
    if (!sections) return;

    if (btnVerificar) btnVerificar.hidden = actividadSeccionActual === null;
    exercise?.remove();
    sections.innerHTML = '';
    Object.entries(actividadData[4].actividades).forEach(([key, data]) => {
        const state = progresoActividadesModulo4[key];
        const isActive = actividadSeccionActual === key;
        const item = document.createElement('div');
        item.className = 'actividad-seccion-item';
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'actividad-seccion-toggle';
        button.classList.toggle('active', isActive);
        button.classList.toggle('completed', state.completada);
        button.setAttribute('aria-expanded', String(isActive));
        button.setAttribute('aria-controls', 'actividad-ejercicio');
        button.addEventListener('click', () => toggleActividadSeccion(key));

        const title = document.createElement('span');
        title.textContent = data.titulo;
        const status = document.createElement('span');
        status.className = 'actividad-seccion-status';
        status.textContent = state.completada ? '✓ Completada' : 'Abrir';
        button.append(title, status);
        item.appendChild(button);
        if (isActive && exercise) {
            exercise.hidden = false;
            item.append(exercise);
        }
        sections.appendChild(item);
    });

    if (actividadSeccionActual === null && exercise) {
        exercise.hidden = true;
        const activeSection = Object.entries(progresoActividadesModulo4)
            .find(([, state]) => !state.completada)?.[0];
        const firstIncompleteItem = activeSection
            ? sections.querySelectorAll('.actividad-seccion-item')[
                Object.keys(actividadData[4].actividades).indexOf(activeSection)
            ]
            : null;
        if (firstIncompleteItem) firstIncompleteItem.append(exercise);
        else sections.append(exercise);
    }
}

function toggleActividadSeccion(key) {
    const sections = document.getElementById('actividad-secciones');
    const exercise = document.getElementById('actividad-ejercicio');
    const subtitle = document.getElementById('actividad-subtitle');
    const feedback = document.getElementById('actividad-feedback');
    const attemptCount = document.getElementById('actividad-attempt-count');
    const btnVerificar = document.getElementById('btn-actividad-verificar');
    const state = progresoActividadesModulo4[key];

    if (!state) return;
    if (actividadSeccionActual === key) {
        actividadSeccionActual = null;
        renderActividadSecciones();
        return;
    }

    actividadSeccionActual = key;
    const data = actividadData[4].actividades[key];
    state.startTime = state.startTime || Date.now();
    state.orden = state.orden || shuffleArray([...data.pasos]);
    actividadOrdenActual = state.orden;
    actividadIntentos = state.intentos;
    actividadStartTime = state.startTime;

    if (subtitle) subtitle.textContent = data.instruccion;
    if (exercise) exercise.hidden = false;
    if (feedback) {
        feedback.style.display = state.completada ? 'block' : 'none';
        feedback.className = state.completada
            ? 'actividad-feedback actividad-feedback-success'
            : 'actividad-feedback';
        feedback.innerHTML = state.completada
            ? '✅ <strong>Esta actividad ya está completa.</strong>'
            : '';
    }
    if (attemptCount) attemptCount.textContent = state.intentos ? `Intentos: ${state.intentos}` : '';
    if (btnVerificar) {
        btnVerificar.disabled = state.completada;
        btnVerificar.textContent = state.completada ? '✅ ¡Correcto!' : '✅ Verificar orden';
    }
    renderActividadList();
    if (state.completada) {
        document.querySelectorAll('#actividad-sortable-list .actividad-card').forEach(card => {
            card.classList.add('card-correct');
            card.setAttribute('draggable', 'false');
        });
    }
    renderActividadSecciones();
}

function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1));

        [arr[i], arr[j]] = [arr[j], arr[i]];

    }

    return arr;

}



function renderActividadList() {

    const list = document.getElementById('actividad-sortable-list');

    if (!list) return;

    list.innerHTML = '';

    actividadOrdenActual.forEach((paso, index) => {

        const card = document.createElement('div');

        card.className = 'actividad-card';

        card.setAttribute('draggable', 'true');

        card.dataset.index = index;

        card.innerHTML = `<span class="actividad-card-handle">☰</span><span class="actividad-card-text">${paso.texto}</span>`;



        // Desktop drag events

        card.addEventListener('dragstart', onActividadDragStart);

        card.addEventListener('dragover', onActividadDragOver);

        card.addEventListener('drop', onActividadDrop);

        card.addEventListener('dragend', onActividadDragEnd);



        // Touch events for mobile

        card.addEventListener('touchstart', onActividadTouchStart, { passive: false });

        card.addEventListener('touchmove', onActividadTouchMove, { passive: false });

        card.addEventListener('touchend', onActividadTouchEnd);



        list.appendChild(card);

    });

}



// --- Drag events (desktop) ---

function onActividadDragStart(e) {

    actividadDragSrcIndex = parseInt(e.currentTarget.dataset.index);

    e.currentTarget.classList.add('dragging');

    e.dataTransfer.effectAllowed = 'move';

}



function onActividadDragOver(e) {

    e.preventDefault();

    e.dataTransfer.dropEffect = 'move';

    const targetCard = e.currentTarget;

    const list = document.getElementById('actividad-sortable-list');

    const cards = [...list.querySelectorAll('.actividad-card:not(.dragging)')];

    cards.forEach(c => c.classList.remove('drag-over'));

    targetCard.classList.add('drag-over');

}



function onActividadDrop(e) {

    e.preventDefault();

    const targetIndex = parseInt(e.currentTarget.dataset.index);

    if (actividadDragSrcIndex === null || actividadDragSrcIndex === targetIndex) return;

    swapActividadCards(actividadDragSrcIndex, targetIndex);

}



function onActividadDragEnd(e) {

    const list = document.getElementById('actividad-sortable-list');

    if (list) list.querySelectorAll('.actividad-card').forEach(c => c.classList.remove('dragging', 'drag-over'));

    actividadDragSrcIndex = null;

}



// --- Touch events (mobile) ---

let actividadTouchSrcIndex = null;

let actividadTouchClone = null;



function onActividadTouchStart(e) {

    actividadTouchSrcIndex = parseInt(e.currentTarget.dataset.index);

    const card = e.currentTarget;

    const rect = card.getBoundingClientRect();

    actividadTouchClone = card.cloneNode(true);

    actividadTouchClone.style.cssText = `

        position: fixed; z-index: 9999; pointer-events: none; opacity: 0.85;

        width: ${rect.width}px; top: ${rect.top}px; left: ${rect.left}px;

        background: #fff; box-shadow: 0 8px 24px rgba(0,0,0,0.18); border-radius: 12px;

    `;

    document.body.appendChild(actividadTouchClone);

    card.classList.add('dragging');

}



function onActividadTouchMove(e) {

    e.preventDefault();

    if (!actividadTouchClone) return;

    const touch = e.touches[0];

    actividadTouchClone.style.top = (touch.clientY - 30) + 'px';

    actividadTouchClone.style.left = (touch.clientX - actividadTouchClone.offsetWidth / 2) + 'px';

}



function onActividadTouchEnd(e) {

    if (!actividadTouchClone) return;

    const touch = e.changedTouches[0];

    if (actividadTouchClone) { actividadTouchClone.remove(); actividadTouchClone = null; }



    const list = document.getElementById('actividad-sortable-list');

    if (!list) return;

    const cards = [...list.querySelectorAll('.actividad-card')];

    cards.forEach(c => c.classList.remove('dragging'));



    // Find which card is under the finger

    let targetIndex = null;

    cards.forEach((card, i) => {

        const rect = card.getBoundingClientRect();

        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&

            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {

            targetIndex = i;

        }

    });



    if (targetIndex !== null && targetIndex !== actividadTouchSrcIndex) {

        swapActividadCards(actividadTouchSrcIndex, targetIndex);

    }

    actividadTouchSrcIndex = null;

}



function swapActividadCards(fromIndex, toIndex) {

    [actividadOrdenActual[fromIndex], actividadOrdenActual[toIndex]] =

        [actividadOrdenActual[toIndex], actividadOrdenActual[fromIndex]];

    if (actividadModuloActual === 4 && actividadSeccionActual) {
        progresoActividadesModulo4[actividadSeccionActual].orden = actividadOrdenActual;
    }
    renderActividadList();


    // Clear feedback on re-sort

    const feedback = document.getElementById('actividad-feedback');

    if (feedback && feedback.classList.contains('actividad-feedback-error')) {

        feedback.style.display = 'none';

    }

}



function verificarOrdenActividad() {

    if (!actividadModuloActual) return;

    const data = actividadModuloActual === 4
        ? actividadData[4].actividades[actividadSeccionActual]
        : actividadData[actividadModuloActual];
    if (!data) return;
    actividadIntentos++;

    const ordenActual = actividadOrdenActual.map(p => p.id);
    const correcto = data.ordenCorrecto.every((id, i) => id === ordenActual[i]);



    const feedback = document.getElementById('actividad-feedback');


    const attemptCount = document.getElementById('actividad-attempt-count');


    const list = document.getElementById('actividad-sortable-list');


    const btnVerificar = document.getElementById('btn-actividad-verificar');


    const exercise = document.getElementById('actividad-ejercicio');

    if (attemptCount) attemptCount.textContent = `Intentos: ${actividadIntentos}`;

    if (actividadModuloActual === 4) {
        const state = progresoActividadesModulo4[actividadSeccionActual];
        state.intentos = actividadIntentos;
        state.orden = actividadOrdenActual;
    }

    if (correcto) {
        // Mark all cards green

        if (list) list.querySelectorAll('.actividad-card').forEach(c => {

            c.classList.remove('card-error');

            c.classList.add('card-correct');

            c.setAttribute('draggable', 'false');

        });

        if (feedback && actividadModuloActual !== 4) {
            feedback.style.display = 'block';

            feedback.className = 'actividad-feedback actividad-feedback-success';

            feedback.innerHTML = '🎉 <strong>¡Perfecto!</strong> El orden es correcto. ¡Módulo completado!';
        }
        if (btnVerificar) { btnVerificar.disabled = true; btnVerificar.textContent = '✅ ¡Correcto!'; }

        // Save result to localStorage
        const moduleName = actividadModuloActual === 4
            ? `${actividadData[4].moduloNombre} - ${data.titulo}`
            : data.moduloNombre;
        guardarResultadoActividad(actividadModuloActual, moduleName, actividadIntentos, 'correcto');

        if (actividadModuloActual === 4) {
            const state = progresoActividadesModulo4[actividadSeccionActual];
            state.completada = true;
            renderActividadSecciones();
            const completedCount = Object.values(progresoActividadesModulo4).filter(activity => activity.completada).length;
            const totalCount = Object.keys(progresoActividadesModulo4).length;
            if (feedback) {
                feedback.style.display = 'block';
                feedback.className = 'actividad-feedback actividad-feedback-success';
                feedback.innerHTML = completedCount === totalCount
                    ? '🎉 <strong>¡Completó las tres actividades!</strong> Ahora puede finalizar el módulo.'
                    : `🎉 <strong>¡Perfecto!</strong> Actividad completada. Lleva ${completedCount} de ${totalCount}; abra otra situación para continuar.`;
            }
            const completedKey = actividadSeccionActual;
            if (completedCount < totalCount) {
                setTimeout(() => {
                    if (actividadSeccionActual !== completedKey) return;
                    actividadSeccionActual = null;
                    if (exercise) exercise.hidden = true;
                    renderActividadSecciones();
                    const subtitle = document.getElementById('actividad-subtitle');
                    if (subtitle) subtitle.textContent = actividadData[4].instruccion;
                }, 1800);
                return;
            }

            setTimeout(() => {
                actividadSeccionActual = null;
                if (exercise) exercise.hidden = true;
                renderActividadSecciones();
                const modal = document.getElementById('modal-actividad');
                if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
                actividadModuloActual = null;
                closeCanvaModal();
                openEncuestaForCurrentModule();
            }, 1800);
            return;
        }

        // Complete the module after short delay
        setTimeout(() => {
            const modal = document.getElementById('modal-actividad');
            if (modal) { modal.style.display = 'none'; document.body.style.overflow = 'auto'; }
            const completedModuleId = actividadModuloActual;
            actividadModuloActual = null;
            closeCanvaModal();
            completeModule(completedModuleId);
        }, 1800);



    } else {

        // Mark incorrect cards red

        if (list) {

            const cards = [...list.querySelectorAll('.actividad-card')];

            cards.forEach((card, i) => {

                card.classList.remove('card-correct', 'card-error');

                if (ordenActual[i] !== data.ordenCorrecto[i]) {

                    card.classList.add('card-error');

                }

            });

        }

        if (feedback) {

            feedback.style.display = 'block';

            feedback.className = 'actividad-feedback actividad-feedback-error';

            feedback.innerHTML = '❌ <strong>Orden incorrecto.</strong> Las tarjetas en rojo no están en el lugar correcto. ¡Inténtelo de nuevo!';

        }

    }

}



// ========================================================

// PERSISTENCIA: localStorage

// ========================================================



function guardarResultadoActividad(moduleId, moduloNombre, intentos, resultado) {

    const tiempoSeg = Math.round((Date.now() - actividadStartTime) / 1000);

    const now = new Date();

    const fecha = now.toLocaleDateString('es-AR');

    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });



    const cometioErrores = intentos > 1;

    const registro = {

        id: `res_${Date.now()}`,

        fecha,

        hora,

        tipo: 'actividad',

        modulo: moduleId,

        modulo_nombre: moduloNombre,

        intentos,

        errores: Math.max(0, intentos - 1),

        cometio_errores: cometioErrores ? 'Sí' : 'No',

        completado_exitoso: resultado === 'correcto',

        resultado,

        tiempo_segundos: tiempoSeg

    };



    try {

        const existentes = JSON.parse(localStorage.getItem(TRAINING_RESULTS_KEY) || '[]');

        existentes.push(registro);

        localStorage.setItem(TRAINING_RESULTS_KEY, JSON.stringify(existentes));

    } catch (e) {

        // localStorage no disponible

    }

}



function guardarResultadoSimulador(errores, tiempoSeg) {

    const now = new Date();

    const fecha = now.toLocaleDateString('es-AR');

    const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });



    const cometioErrores = errores > 0;

    const registro = {

        id: `sim_${Date.now()}`,

        fecha,

        hora,

        tipo: 'simulador',

        modulo: 'Simulador',

        modulo_nombre: 'Simulador Práctico',

        intentos: errores,

        errores: errores,

        cometio_errores: cometioErrores ? 'Sí' : 'No',

        completado_exitoso: true,

        resultado: 'Exitoso',

        tiempo_segundos: tiempoSeg

    };



    try {

        const existentes = JSON.parse(localStorage.getItem(TRAINING_RESULTS_KEY) || '[]');

        existentes.push(registro);

        localStorage.setItem(TRAINING_RESULTS_KEY, JSON.stringify(existentes));

    } catch (e) {

        // localStorage no disponible

    }

}



function getResultados() {

    try {

        return JSON.parse(localStorage.getItem(TRAINING_RESULTS_KEY) || '[]');

    } catch (e) {

        return [];

    }

}



// ========================================================

// PANEL ADMIN

// ========================================================



const ADMIN_PASSWORD = 'admin123';



function openAdminLogin() {

    const input = document.getElementById('admin-password-input');

    const error = document.getElementById('admin-login-error');

    if (input) input.value = '';

    if (error) error.style.display = 'none';

    openModal('modal-admin-login');

    setTimeout(() => { if (input) input.focus(); }, 100);

}



function verifyAdminPassword() {

    const input = document.getElementById('admin-password-input');

    const error = document.getElementById('admin-login-error');

    if (!input) return;



    if (input.value === ADMIN_PASSWORD) {

        closeModal('modal-admin-login');

        input.value = '';

        renderAdminPanel();

        openModal('modal-admin-panel');

    } else {

        if (error) error.style.display = 'block';

        input.value = '';

        input.focus();

    }

}



function renderAdminPanel() {

    const resultados = getResultados();

    const tbody = document.getElementById('admin-results-tbody');

    const noResults = document.getElementById('admin-no-results');

    const summary = document.getElementById('admin-panel-summary');



    if (!tbody) return;

    tbody.innerHTML = '';



    if (resultados.length === 0) {

        if (noResults) noResults.style.display = 'block';

        if (summary) summary.innerHTML = '';

        return;

    }



    if (noResults) noResults.style.display = 'none';



    // Estadísticas segmentadas

    const actividades = resultados.filter(r => r.tipo !== 'simulador');

    const simuladores = resultados.filter(r => r.tipo === 'simulador');



    // Métricas de Actividades de Módulos

    const totalIntentos = actividades.reduce((s, r) => s + (Number(r.intentos) || 1), 0);

    const promIntentos = actividades.length > 0 ? (totalIntentos / actividades.length).toFixed(1) : '-';

    const totalTiempoAct = actividades.reduce((s, r) => s + (Number(r.tiempo_segundos) || 0), 0);

    const promTiempoAct = actividades.length > 0 ? Math.round(totalTiempoAct / actividades.length) + 's' : '-';



    // Métricas del Simulador Práctico

    const totalErroresSim = simuladores.reduce((s, r) => s + (Number(r.errores) || 0), 0);

    const promErroresSim = simuladores.length > 0 ? (totalErroresSim / simuladores.length).toFixed(1) : '-';

    const totalTiempoSim = simuladores.reduce((s, r) => s + (Number(r.tiempo_segundos) || 0), 0);

    const promTiempoSim = simuladores.length > 0 ? Math.round(totalTiempoSim / simuladores.length) + 's' : '-';

    const simSinErrores = simuladores.filter(r => (Number(r.errores) || 0) === 0).length;



    if (summary) {

        summary.innerHTML = `

            <div style="width: 100%; display: flex; flex-direction: column; gap: 12px;">

                <div>

                    <div style="font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 6px;">📚 Módulos de Aprendizaje:</div>

                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">

                        <div class="admin-stat"><strong>${actividades.length}</strong><span>Actividades realizadas</span></div>

                        <div class="admin-stat"><strong>${promIntentos}</strong><span>Intentos promedio</span></div>

                        <div class="admin-stat"><strong>${promTiempoAct}</strong><span>Tiempo promedio</span></div>

                    </div>

                </div>

                <div>

                    <div style="font-size: 0.85rem; font-weight: 700; color: #374151; margin-bottom: 6px;">🎮 Simulador Práctico:</div>

                    <div style="display: flex; gap: 10px; flex-wrap: wrap;">

                        <div class="admin-stat"><strong>${simuladores.length}</strong><span>Prácticas completadas</span></div>

                        <div class="admin-stat"><strong>${promErroresSim}</strong><span>Errores promedio</span></div>

                        <div class="admin-stat"><strong>${simSinErrores}</strong><span>Completadas sin errores</span></div>

                        <div class="admin-stat"><strong>${promTiempoSim}</strong><span>Tiempo promedio</span></div>

                    </div>

                </div>

            </div>

        `;

    }



    // Table rows (most recent first)

    [...resultados].reverse().forEach(r => {

        const tr = document.createElement('tr');

        const isSim = r.tipo === 'simulador';

        const moduloLabel = isSim ? '🎮 Simulador Práctico' : `Mód. ${r.modulo} – ${r.modulo_nombre}`;

        const erroresLabel = isSim

            ? (r.errores === 0 ? '0 errores (Sin errores ✓)' : `${r.errores} error(es)`)

            : `${r.intentos} intento(s)`;

        const resultadoLabel = isSim

            ? (r.completado_exitoso ? '✅ Completado exitoso' : 'Incompleto')

            : (r.resultado === 'correcto' ? '✅ Correcto' : '❌ Incorrecto');

        const resultadoClass = (isSim ? r.completado_exitoso : r.resultado === 'correcto') ? 'result-ok' : 'result-fail';



        tr.innerHTML = `

            <td>${r.fecha}</td>

            <td>${r.hora}</td>

            <td><strong>${moduloLabel}</strong></td>

            <td>${erroresLabel}</td>

            <td>${r.tiempo_segundos}s</td>

            <td class="${resultadoClass}">${resultadoLabel}</td>

        `;

        tbody.appendChild(tr);

    });

}



function exportAdminCSV() {

    const resultados = getResultados();

    if (resultados.length === 0) {

        alert('No hay resultados para exportar.');

        return;

    }

    const headers = ['ID', 'Fecha', 'Hora', 'Tipo', 'Módulo / Práctica', 'Intentos / Errores', 'Cometió Errores', 'Completado Exitoso', 'Tiempo (seg)'];

    const rows = resultados.map(r => {

        const isSim = r.tipo === 'simulador';

        return [

            r.id,

            r.fecha,

            r.hora,

            isSim ? 'Simulador' : 'Actividad Módulo',

            isSim ? 'Simulador Práctico' : `Módulo ${r.modulo}: ${r.modulo_nombre}`,

            isSim ? r.errores : r.intentos,

            r.cometio_errores || ((isSim ? r.errores > 0 : r.intentos > 1) ? 'Sí' : 'No'),

            r.completado_exitoso ? 'Sí' : (r.resultado === 'correcto' ? 'Sí' : 'No'),

            r.tiempo_segundos

        ];

    });

    const csvContent = [headers, ...rows].map(row => row.map(v => `"${v}"`).join(',')).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });

    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');

    a.href = url;

    a.download = `resultados_uber_training_${new Date().toISOString().slice(0,10)}.csv`;

    a.click();

    URL.revokeObjectURL(url);

}



function clearAdminResults() {

    if (!confirm('¿Está seguro de que desea borrar TODOS los resultados? Esta acción no se puede deshacer.')) return;

    try {

        localStorage.removeItem(TRAINING_RESULTS_KEY);

    } catch (e) {}

    renderAdminPanel();

}



// ========================================================
// REGLAS DE INTERACCIÓN DEL SIMULADOR: qué se puede tocar en cada paso
// ========================================================
const SIM_BACK_MSG = 'El botón "volver" no está disponible en la práctica. Use "← Paso anterior" del panel.';

// Acciones no disponibles en ningún paso (mensaje específico)
const SIM_COMMON_BLOCKED = [
    ['.sim-screen-back:not(.sheet-close-btn), .sim-back-btn, .uber-floating-back-circle', SIM_BACK_MSG],
    ['.uber-gps-btn:not(#btn-pickup-recenter)', 'El botón de centrar mapa no se usa en este paso.'],
    ['.uber-later-chip', 'Programar un viaje para más tarde no es parte de esta práctica. Toque la barra "¿A dónde vas?".'],
    ['.uber-schedule-square-btn', 'Programar el viaje para más tarde no está disponible. Toque el botón negro para confirmar.'],
    ['.uber-add-stop-btn', 'Agregar paradas no es parte de esta práctica. Escriba o seleccione el destino.'],
    ['.uber-streetview-thumb', 'La vista de calle no está disponible en la práctica.']
];

const SIM_STEP_RULES = {
    1: {
        allowed: ['.uber-search-pill-bar'],
        hint: 'En el inicio solo debe tocar la barra "¿A dónde vas?" (borde azul).'
    },
    2: {
        allowed: ['#sim-destination-input', '.uber-place-row', '.uber-suggestion-card'],
        hint: 'Solo puede escribir "Hospital Privado" o seleccionar "Hospital Privado Universitario".'
    },
    3: {
        allowed: ['.uber-car-option', '.uber-payment-row', '#sim-choose-car-btn'],
        hint: 'Aquí solo puede elegir el tipo de viaje, el método de pago y confirmar con el botón negro.'
    },
    4: {
        allowed: ['#pickup-marker', '#btn-pickup-recenter', '#confirm-pickup-btn', '#pickup-map'],
        hint: 'Mueva el puntero sobre el mapa hasta Av. Colón 1450 (o toque ⌖) y confirme el punto de partida.'
    },
    5: {
        allowed: ['.uber-safety-pill-btn', '.uber-msg-pill-btn', '.uber-call-round-btn', '.sim-check-item',
                  '.uber-grey-pill-btn', '#sim-board-car-btn'],
        hint: 'Revise los datos del chofer, marque las 2 verificaciones y toque "Subir al auto e iniciar el viaje".'
    },
    6: {
        allowed: ['.uber-safety-pill-btn', '.uber-grey-pill-btn', '.uber-intrip-sheet > .uber-confirm-btn',
                  '.uber-star-btn', '.uber-skip-pill', '.sim-cert-btn'],
        hint: 'Toque "Llegar a destino y calificar viaje"; luego elija estrellas o toque "Omitir".'
    }
};

function simPaymentSheetOpen() {
    const sheet = document.getElementById('sim-payment-sheet');
    return Boolean(sheet && sheet.style.display !== 'none');
}

function simIsRatingSubscreenVisible() {
    const ratingView = document.getElementById('sim-subscreen-rating');
    return Boolean(ratingView && ratingView.style.display !== 'none');
}

function getBlockedStepMessage(step, target) {
    if (step === 1) {
        if (target.closest('.uber-loc-pill')) {
            return 'La ubicación actual ya está fijada en Av. Colón 1450. Para comenzar, toque "¿A dónde vas?".';
        }
        if (target.closest('.uber-cart-icon-btn')) {
            return 'El carrito no corresponde a un viaje. Toque la barra "¿A dónde vas?" (borde azul).';
        }
        const tab = target.closest('.uber-top-tab');
        if (tab) {
            const label = tab.textContent || '';
            if (label.includes('Eats')) return 'Uber Eats es para pedir comida, no viajes. Toque "¿A dónde vas?".';
            if (label.includes('Envíos')) return 'Envíos es para paquetes, no para pedir un auto. Toque "¿A dónde vas?".';
            return 'Ya está en la pestaña de viajes Uber. Ahora toque la barra "¿A dónde vas?".';
        }
        if (target.closest('.uber-promo-dest-card')) {
            return 'Ese es un acceso rápido del historial. En este paso primero debe abrir el buscador tocando "¿A dónde vas?".';
        }
        if (target.closest('.uber-section-header')) {
            return 'La sección "Para ti" no se utiliza aquí. Toque la barra "¿A dónde vas?".';
        }
        const serviceCard = target.closest('.uber-service-card');
        if (serviceCard) {
            const label = serviceCard.textContent || '';
            if (label.includes('Envíos')) {
                return 'Envíos es para mandar paquetes. Para pedir un viaje, toque "¿A dónde vas?".';
            }
            return 'El tipo de viaje se elige en el Paso 3. Primero abra el buscador tocando "¿A dónde vas?".';
        }
        if (target.closest('.uber-recent-item')) {
            return 'Esa es su dirección guardada de origen (Casa). Para ingresar el destino, toque "¿A dónde vas?".';
        }
        const navItem = target.closest('.uber-nav-item');
        if (navItem) {
            const label = (navItem.textContent || '').trim();
            if (label.includes('Inicio')) return 'Ya se encuentra en Inicio. Toque la barra "¿A dónde vas?".';
            return 'La sección "' + label + '" no está disponible en esta práctica. Toque "¿A dónde vas?".';
        }
        if (target.closest('.uber-bottom-nav-pill')) {
            return 'La barra inferior no está disponible en esta práctica. Toque "¿A dónde vas?".';
        }
    }

    if (step === 2) {
        if (target.closest('#sim-origin-input, .origin-row, .uber-route-timeline')) {
            return 'El origen ya está fijado en Av. Colón 1450. Escriba o seleccione el destino.';
        }
        if (target.closest('.uber-plan-pill')) {
            return 'Esa opción ya está configurada para la práctica. Escriba "Hospital Privado" o tóquelo debajo.';
        }
        if (target.closest('.uber-specific-route-helper')) {
            return 'Escriba "Hospital Privado" en el campo de arriba o toque "Hospital Privado Universitario".';
        }
    }

    if (step === 3) {
        if (target.closest('.uber-map-route-pill')) {
            return 'La ruta ya está confirmada (Av. Colón 1450 ➔ Hospital Privado). Elija auto, pago y confirme.';
        }
        if (target.closest('.sim-map-route')) {
            return 'El mapa solo muestra la ruta. Elija un tipo de viaje, el método de pago y toque el botón negro.';
        }
        if (target.closest('.uber-sheet-heading-compact, .sheet-drag-handle')) {
            return 'Elija un tipo de viaje (Essential, Comfort o Uber Mujeres), el pago y toque el botón negro.';
        }
    }

    if (step === 4) {
        if (target.closest('.uber-pickup-sheet')) {
            return 'Primero ubique el puntero en el mapa sobre Av. Colón 1450 (o toque ⌖) y luego toque el botón negro.';
        }
    }

    if (step === 5) {
        if (target.closest('.sim-map-driver')) {
            return 'El mapa solo muestra la llegada del auto. Verifique los datos abajo, marque las 2 casillas y suba.';
        }
        if (target.closest('.uber-trip-countdown-row')) {
            return 'Ese es el tiempo estimado de llegada (4 min). Marque las 2 verificaciones antes de subir.';
        }
        if (target.closest('.uber-driver-hero-card')) {
            return 'Estos son los datos para comparar. Para confirmarlos, marque las 2 casillas azules de abajo.';
        }
        if (target.closest('.sim-safety-title')) {
            return 'Toque las 2 casillas debajo de este título para marcar patente/auto y conductor.';
        }
        if (target.closest('.uber-trip-details-list, .uber-detail-row')) {
            return 'Ese es el resumen del viaje. Puede tocar "Compartir" o confirmar las 2 casillas para subir.';
        }
    }

    if (step === 6) {
        if (simIsRatingSubscreenVisible()) {
            if (target.closest('.uber-receipt-mini')) {
                return 'Ese es el comprobante del viaje. Califique con las estrellas o toque "Omitir" para ver su certificado.';
            }
            if (target.closest('.sim-success-card')) {
                return '¡Práctica completada! Toque el botón verde "Ver mi Certificado de Práctica" para abrirlo.';
            }
            return simCompleted
                ? '¡Simulación finalizada! Puede abrir su certificado con el botón verde o presionar "Reiniciar".'
                : 'Toque de 1 a 5 estrellas para calificar el viaje, o toque "Omitir" para abrir su certificado.';
        } else {
            if (target.closest('.sim-map-intrip')) {
                return 'Está en viaje al Hospital Privado. Toque el botón negro "Llegar a destino y calificar viaje".';
            }
            return 'Cuando termine el recorrido, toque el botón negro "Llegar a destino y calificar viaje".';
        }
    }

    const rule = SIM_STEP_RULES[step];
    return (rule && rule.hint) || 'Toque el elemento resaltado para continuar.';
}

// Devuelve { ok: true } o { ok: false, message, soft }
function evaluateSimClick(rawTarget) {
    const step = currentSimStep;
    const rule = SIM_STEP_RULES[step];
    const target = (rawTarget && typeof rawTarget.closest === 'function') ? rawTarget : (rawTarget && rawTarget.parentElement);
    if (!rule || !target || !target.closest) return { ok: true };

    // Hoja de pago abierta en Paso 3: solo se puede elegir pago o cerrar con ✕
    if (step === 3 && simPaymentSheetOpen()) {
        if (target.closest('.payment-modal-option') || target.closest('.sheet-close-btn')) {
            return { ok: true };
        }
        if (target.closest('#sim-payment-sheet')) {
            return { ok: false, soft: true, message: 'Toque Efectivo, Mastercard o Visa Débito (o cierre con la ✕).' };
        }
        return { ok: false, message: 'Primero elija una forma de pago o cierre la ventana con la ✕.' };
    }

    for (const [selector, message] of SIM_COMMON_BLOCKED) {
        if (target.closest(selector)) return { ok: false, message };
    }

    // En Paso 6, separar estrictamente acciones de 6A (en viaje) vs 6B (calificación)
    let allowedSelectors = rule.allowed;
    if (step === 6) {
        allowedSelectors = simIsRatingSubscreenVisible()
            ? ['.uber-star-btn', '.uber-skip-pill', '.sim-cert-btn']
            : ['.uber-safety-pill-btn', '.uber-grey-pill-btn', '.uber-intrip-sheet > .uber-confirm-btn'];
    }

    if (!allowedSelectors.some(sel => target.closest(sel))) {
        return { ok: false, message: getBlockedStepMessage(step, target) };
    }

    // Condiciones previas de botones permitidos
    if (step === 4 && target.closest('#confirm-pickup-btn')) {
        const btn = document.getElementById('confirm-pickup-btn');
        if (btn && btn.getAttribute('aria-disabled') === 'true') {
            return { ok: false, soft: true, message: 'Primero ubique el puntero sobre el punto azul de Av. Colón 1450 (o toque ⌖).' };
        }
    }
    if (step === 5 && target.closest('#sim-board-car-btn')) {
        const checks = Array.from(document.querySelectorAll('#sim-screen-5 .sim-check-item'));
        const done = checks.filter(c => c.classList.contains('checked'));
        if (done.length === 0) {
            return { ok: false, message: 'Antes de subir al auto, toque y marque las 2 verificaciones: patente/auto y conductor.' };
        }
        if (done.length < checks.length) {
            if (checks[0] && !checks[0].classList.contains('checked')) {
                return { ok: false, message: 'Falta marcar la verificación 1: Patente AE 842 KQ y auto.' };
            }
            return { ok: false, message: 'Falta marcar la verificación 2: Conductor Carlos Alberto Pereyra.' };
        }
    }
    return { ok: true };
}

function simGuardClick(event) {
    const result = evaluateSimClick(event.target);
    if (result.ok) return;
    event.stopPropagation();
    event.preventDefault();
    triggerPhoneError(result.message, result.soft);
}

// Navegación por los círculos de pasos: solo hacia atrás
function simStepperClick(step, event) {
    if (event) event.stopPropagation();
    if (step === currentSimStep) return;
    if (step < currentSimStep) {
        simTriggerStep(step);
        return;
    }
    triggerPhoneError('Complete el paso ' + currentSimStep + ' antes de avanzar al paso ' + step + '.');
}

let simGuardsInitialized = false;
function initSimulatorGuards() {
    if (simGuardsInitialized) return;
    const phoneScreen = document.querySelector('.phone-screen');
    if (!phoneScreen) return;
    simGuardsInitialized = true;

    phoneScreen.addEventListener('click', simGuardClick, true);
    phoneScreen.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            const target = (event.target && typeof event.target.closest === 'function') ? event.target : (event.target && event.target.parentElement);
            const interactive = target && target.closest ? target.closest('[role="button"], [role="checkbox"]') : null;
            if (interactive && interactive.tagName !== 'BUTTON' && interactive.tagName !== 'INPUT') {
                event.preventDefault();
                interactive.click();
            }
        }
    });

    const pickupMarker = document.getElementById('pickup-marker');
    if (pickupMarker) {
        pickupMarker.addEventListener('keydown', (event) => {
            if (currentSimStep !== 4) return;
            const deltas = {
                ArrowLeft: [-5, 0],
                ArrowRight: [5, 0],
                ArrowUp: [0, -5],
                ArrowDown: [0, 5]
            };
            const d = deltas[event.key];
            if (!d) return;
            event.preventDefault();
            pickupMarkerPos = {
                left: Math.max(15, Math.min(85, pickupMarkerPos.left + d[0])),
                top: Math.max(22, Math.min(82, pickupMarkerPos.top + d[1]))
            };
            applyPickupMapTransform(true);
            const dist = Math.hypot(
                pickupMarkerPos.left - PICKUP_TARGET_POS.left,
                pickupMarkerPos.top - PICKUP_TARGET_POS.top
            );
            if (dist > 13) {
                triggerPhoneError('Ese no es el lugar de partida. Acerque el puntero al punto azul de Av. Colón 1450 o toque ⌖.', true);
            } else {
                clearPhoneError();
            }
        });
    }
    const originInput = document.getElementById('sim-origin-input');
    if (originInput) originInput.setAttribute('readonly', 'readonly');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSimulatorGuards);
} else {
    initSimulatorGuards();
}
