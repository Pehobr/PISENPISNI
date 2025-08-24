// js/obnova-menu.js

(function(window) {
    const ObnovaMenu = {
        appElements: null, // Bude nastaveno z obnova-core.js

        init: function(elements) {
            this.appElements = elements;
            this.setupEventListeners();
            this.updatePauseButtonUI(); // Inicializace UI tlačítka pauzy
        },

        toggleMenu: function(show) {
            const { appContainer, overlay } = this.appElements;
            if (appContainer) {
                appContainer.classList.toggle('menu-open', show);
            }
            if (overlay) {
                overlay.style.display = show ? 'block' : 'none';
            }
        },

        handlePause: function() {
            const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
            if (isPaused) {
                const pausedDateStr = localStorage.getItem('obnovaPausedDate');
                const startDateStr = localStorage.getItem('obnovaStartDate');
                if (pausedDateStr && startDateStr) {
                    const pauseDuration = Date.now() - new Date(pausedDateStr).getTime();
                    const newStartDate = new Date(new Date(startDateStr).getTime() + pauseDuration);
                    localStorage.setItem('obnovaStartDate', newStartDate.toISOString().split('T')[0]);
                    if (this.appElements.sideMenuDateInput) {
                        this.appElements.sideMenuDateInput.value = newStartDate.toISOString().split('T')[0];
                    }
                    localStorage.removeItem('obnovaIsPaused');
                    localStorage.removeItem('obnovaPausedDate');
                }
            } else {
                localStorage.setItem('obnovaIsPaused', 'true');
                localStorage.setItem('obnovaPausedDate', new Date().toISOString());
            }
            this.updatePauseButtonUI();
            // Po pozastavení/pokračování je potřeba znovu spustit run() z core
            // Toto volání bude delegováno přes obnova-core
            // window.ObnovaCore.run(); // Tato linka bude odkomentována v obnova-core.js
            setTimeout(() => this.toggleMenu(false), 500);
        },

        updatePauseButtonUI: function() {
            const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
            if (this.appElements.pauseBtn) {
                this.appElements.pauseBtn.textContent = isPaused ? 'Pokračovat v obnově' : 'Pozastavit obnovu';
                this.appElements.pauseBtn.classList.toggle('paused-state', isPaused);
            }
        },

        setupEventListeners: function() {
            this.appElements.menuToggleBtn?.addEventListener('click', () => this.toggleMenu(true));
            this.appElements.closeMenuBtn?.addEventListener('click', () => this.toggleMenu(false));
            this.appElements.overlay?.addEventListener('click', () => this.toggleMenu(false));
            this.appElements.pauseBtn?.addEventListener('click', () => {
                this.handlePause();
                // Nyní voláme run() přes ObnovaCore
                if (window.ObnovaCore && typeof window.ObnovaCore.run === 'function') {
                    window.ObnovaCore.run();
                }
            });
            // Listenery pro setupBtn a settingsBtn budou řešeny v obnova-core.js,
            // jelikož volají saveAndRun(), což je core logika.
        }
    };

    window.ObnovaMenu = ObnovaMenu;
})(window);