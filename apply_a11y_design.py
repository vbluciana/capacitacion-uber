# Update script.js and style.css for elegant accessibility design

# 1. Update script.js
with open("capacitacion-uber/script.js", "r", encoding="utf-8") as f:
    js = f.read()

old_js_block = """    if (contrastButton) {
        contrastButton.setAttribute('aria-pressed', String(accessibilityState.highContrast));
        contrastButton.textContent = accessibilityState.highContrast ? 'Contraste alto: ON' : 'Alto contraste';
    }"""

new_js_block = """    if (contrastButton) {
        contrastButton.setAttribute('aria-pressed', String(accessibilityState.highContrast));
        contrastButton.setAttribute('aria-label', accessibilityState.highContrast ? 'Desactivar alto contraste' : 'Activar alto contraste');
    }

    const fontIndicator = document.getElementById('a11y-font-indicator');
    if (fontIndicator) {
        fontIndicator.textContent = `${Math.round(accessibilityState.fontScale * 100)}%`;
    }"""

js_norm = js.replace("\r\n", "\n")
old_js_norm = old_js_block.replace("\r\n", "\n")
new_js_norm = new_js_block.replace("\r\n", "\n")

if old_js_norm in js_norm:
    js_norm = js_norm.replace(old_js_norm, new_js_norm, 1)
    with open("capacitacion-uber/script.js", "w", encoding="utf-8") as f:
        f.write(js_norm.replace("\n", "\r\n"))
    print("script.js updated successfully")
else:
    print("old_js_block not found")

# 2. Update style.css
with open("capacitacion-uber/style.css", "r", encoding="utf-8") as f:
    css = f.read()

old_css_toolbar = """.accessibility-toolbar {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.accessibility-toggle,
.accessibility-option {
    border: 2px solid var(--secondary-color);
    background: var(--card-bg);
    color: var(--text-color);
    border-radius: 999px;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.accessibility-toggle {
    padding: 8px 16px;
    font-size: 0.95rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
}

.accessibility-toggle:hover,
.accessibility-toggle:focus-visible,
.accessibility-option:hover,
.accessibility-option:focus-visible {
    transform: translateY(-1px);
    background: #E8F0FE;
}

.accessibility-menu {
    display: none;
    position: absolute;
    top: calc(100% + 8px);
    right: 0;
    z-index: 1050;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border-radius: 16px;
    background: rgba(255,255,255,0.98);
    border: 1px solid rgba(39,110,241,0.2);
    box-shadow: 0 16px 32px rgba(0,0,0,0.14);
    min-width: 190px;
    animation: fadeInAccessibility 0.2s ease-out;
}

.accessibility-menu.active {
    display: flex;
}

.accessibility-menu[hidden] {
    display: none !important;
}

@keyframes fadeInAccessibility {
    from {
        opacity: 0;
        transform: translateY(-6px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.accessibility-option {
    padding: 10px 14px;
    border-radius: 12px;
    text-align: left;
}

body.high-contrast .accessibility-menu {
    background: rgba(17,17,17,0.96);
    border-color: #ffd000;
}"""

new_css_toolbar = """.accessibility-toolbar {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
}

.accessibility-toggle {
    border: 1px solid #CBD5E1;
    background: #FFFFFF;
    color: #0F172A;
    border-radius: 9999px;
    font: inherit;
    font-size: 0.92rem;
    font-weight: 600;
    cursor: pointer;
    padding: 8px 18px;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    white-space: nowrap;
}

.accessibility-toggle:hover {
    background: #F8FAFC;
    border-color: #94A3B8;
    color: #000000;
    box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
    transform: translateY(-1px);
}

.accessibility-toggle[aria-expanded="true"] {
    background: #EFF6FF;
    border-color: #276EF1;
    color: #1D4ED8;
    box-shadow: 0 0 0 3px rgba(39, 110, 241, 0.15);
}

.a11y-icon {
    font-size: 1.05rem;
    line-height: 1;
}

.a11y-label {
    letter-spacing: -0.01em;
}

.a11y-chevron {
    font-size: 0.75rem;
    color: #64748B;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-block;
}

.accessibility-toggle[aria-expanded="true"] .a11y-chevron {
    transform: rotate(180deg);
    color: #1D4ED8;
}

/* Menú flotante elegante */
.accessibility-menu {
    display: none;
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    z-index: 1050;
    width: 270px;
    padding: 16px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(226, 232, 240, 0.85);
    box-shadow: 0 20px 40px -12px rgba(0, 0, 0, 0.14), 0 4px 16px -2px rgba(0, 0, 0, 0.05);
    animation: fadeInA11yMenu 0.22s cubic-bezier(0.16, 1, 0.3, 1);
}

.accessibility-menu.active {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.accessibility-menu[hidden] {
    display: none !important;
}

@keyframes fadeInA11yMenu {
    from {
        opacity: 0;
        transform: translateY(-8px) scale(0.98);
    }
    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

/* Header del menú */
.a11y-menu-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid #F1F5F9;
}

.a11y-menu-title {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #64748B;
}

/* Secciones internas */
.a11y-section {
    display: flex;
    flex-direction: column;
}

.a11y-section-label {
    font-size: 0.82rem;
    font-weight: 600;
    color: #334155;
    margin-bottom: 6px;
}

/* Controles de fuente (+ / -) */
.a11y-font-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 4px;
}

.a11y-btn-sm {
    width: 44px;
    height: 36px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #FFFFFF;
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 700;
    font-size: 0.95rem;
    color: #0F172A;
    transition: all 0.15s ease;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
}

.a11y-btn-sm:hover {
    background: #276EF1;
    color: #FFFFFF;
    border-color: #276EF1;
    transform: translateY(-1px);
}

.a11y-btn-sm:active {
    transform: translateY(0);
}

.a11y-font-indicator {
    font-size: 0.88rem;
    font-weight: 700;
    color: #334155;
    min-width: 52px;
    text-align: center;
}

/* Fila de switch de alto contraste */
.a11y-toggle-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #F8FAFC;
    border: 1px solid #E2E8F0;
    border-radius: 12px;
    padding: 10px 14px;
    cursor: pointer;
    font: inherit;
    transition: all 0.2s ease;
    box-sizing: border-box;
}

.a11y-toggle-row:hover {
    background: #F1F5F9;
    border-color: #CBD5E1;
}

.a11y-toggle-info {
    display: flex;
    align-items: center;
    gap: 8px;
}

.a11y-toggle-icon {
    font-size: 1rem;
    line-height: 1;
}

.a11y-toggle-text {
    font-size: 0.88rem;
    font-weight: 600;
    color: #1E293B;
}

/* Switch toggle visual */
.a11y-switch {
    width: 42px;
    height: 24px;
    background: #CBD5E1;
    border-radius: 9999px;
    position: relative;
    transition: background-color 0.25s ease;
    display: inline-block;
    flex-shrink: 0;
}

.a11y-switch-thumb {
    width: 18px;
    height: 18px;
    background: #FFFFFF;
    border-radius: 50%;
    position: absolute;
    top: 3px;
    left: 3px;
    transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
}

.a11y-toggle-row[aria-pressed="true"] {
    background: #EFF6FF;
    border-color: #93C5FD;
}

.a11y-toggle-row[aria-pressed="true"] .a11y-switch {
    background: #276EF1;
}

.a11y-toggle-row[aria-pressed="true"] .a11y-switch-thumb {
    transform: translateX(18px);
}

/* Footer con botón de restablecer */
.a11y-footer {
    padding-top: 8px;
    border-top: 1px solid #F1F5F9;
}

.a11y-reset-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    background: transparent;
    border: none;
    color: #64748B;
    font-size: 0.8rem;
    font-weight: 600;
    padding: 8px 10px;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.15s ease;
}

.a11y-reset-btn:hover {
    background: #F1F5F9;
    color: #0F172A;
}

/* Modo Alto Contraste */
body.high-contrast .accessibility-toggle {
    border: 2px solid #FFD000;
    background: #000000;
    color: #FFFFFF;
}

body.high-contrast .accessibility-toggle[aria-expanded="true"] {
    background: #111111;
    border-color: #FFD000;
    color: #FFD000;
}

body.high-contrast .accessibility-toggle .a11y-chevron {
    color: #FFD000;
}

body.high-contrast .accessibility-menu {
    background: #000000;
    border: 2px solid #FFD000;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.95);
}

body.high-contrast .a11y-menu-title,
body.high-contrast .a11y-section-label,
body.high-contrast .a11y-toggle-text,
body.high-contrast .a11y-font-indicator,
body.high-contrast .a11y-reset-btn {
    color: #FFFFFF !important;
}

body.high-contrast .a11y-font-controls,
body.high-contrast .a11y-toggle-row {
    background: #111111;
    border: 1px solid #FFD000;
}

body.high-contrast .a11y-btn-sm {
    background: #000000;
    color: #FFD000;
    border: 1px solid #FFD000;
}

body.high-contrast .a11y-btn-sm:hover {
    background: #FFD000;
    color: #000000;
}

body.high-contrast .a11y-toggle-row[aria-pressed="true"] .a11y-switch {
    background: #FFD000;
}

body.high-contrast .a11y-toggle-row[aria-pressed="true"] .a11y-switch-thumb {
    background: #000000;
}

body.high-contrast .a11y-reset-btn:hover {
    background: #222222;
    color: #FFD000 !important;
}"""

css_norm = css.replace("\r\n", "\n")
old_css_norm = old_css_toolbar.replace("\r\n", "\n")
new_css_norm = new_css_toolbar.replace("\r\n", "\n")

if old_css_norm in css_norm:
    css_norm = css_norm.replace(old_css_norm, new_css_norm, 1)
    with open("capacitacion-uber/style.css", "w", encoding="utf-8") as f:
        f.write(css_norm.replace("\n", "\r\n"))
    print("style.css updated successfully")
else:
    print("old_css_toolbar not found")
