/**
 * Hlavní globální skript pro Neux Child šablonu (verze 3.3.0)
 * - Obsahuje pouze globální funkce a úpravy platné pro celý web.
 * - Logika pro Duchovní obnovu byla přesunuta do obnova.js.
 */

// Globální proměnné pro sledování stavu TTS přehrávače
// Jsou definovány zde, aby k nim měl přístup i skript obnova.js
let currentAudio = null;
let currentPlayBtn = null;

document.addEventListener('DOMContentLoaded', function() {

    // --- GLOBÁLNÍ FUNKCIONALITA (spustí se na všech stránkách) ---
    document.body.addEventListener('click', function(event) {
        const toggleButton = event.target.closest('.accordion-toggle');
        if (!toggleButton) return;
        event.preventDefault();
        const item = toggleButton.closest('.accordion-item');
        if (item) {
            const contentToToggle = item.querySelector('.hidden-text');
            if (contentToToggle) {
                const isHidden = contentToToggle.style.display === 'none' || contentToToggle.style.display === '';
                contentToToggle.style.display = isHidden ? 'block' : 'none';
            }
        }
    });

    // --- ÚPRAVA SPODNÍ NAVIGAČNÍ LIŠTY ---
    // Tento kód upravuje položku "Informace" na "Poznámky"
    const infoButton = document.querySelector('.app-bottom-nav a[href*="informace"]');
    
    if (infoButton) {
        infoButton.href = 'https://pisenpisni.audiokatechismus.cz/moje-poznamky/';
        infoButton.setAttribute('aria-label', 'Poznámky');
        const icon = infoButton.querySelector('i');
        if (icon) {
            icon.className = 'fas fa-pencil-alt';
        }
        const span = infoButton.querySelector('span');
        if (span) {
            span.textContent = 'Poznámky';
        }
    }
    
});