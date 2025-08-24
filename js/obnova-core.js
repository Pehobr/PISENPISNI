// js/obnova-core.js

(function(window) {
    const app = {
        elements: {
            appContainer: document.getElementById('obnova-app-container'),
            contentContainer: document.getElementById('content-container'),
            daysNav: document.getElementById('days-nav'),
            setupOverlay: document.getElementById('initial-setup-overlay'),
            setupBtn: document.getElementById('initial-save-btn'),
            setupDateInput: document.getElementById('initial-start-date'),
            menuToggleBtn: document.getElementById('menu-toggle-btn'),
            closeMenuBtn: document.getElementById('close-menu-btn'),
            overlay: document.getElementById('app-overlay'),
            sideMenuDateInput: document.getElementById('start-date-input'),
            settingsBtn: document.getElementById('save-settings-btn'),
            pauseBtn: document.getElementById('pause-resume-btn'),
            // Elementy pro modál prezentace
            prezentaceModal: document.getElementById('prezentace-modal'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            modalIframe: document.querySelector('#prezentace-modal iframe'),
            // NOVÉ: Elementy pro modál PDF
            pdfModal: document.getElementById('pdf-modal'),
            pdfModalOverlay: document.getElementById('pdf-modal-overlay'),
            pdfModalCloseBtn: document.getElementById('pdf-modal-close-btn'),
            pdfModalContent: document.getElementById('pdf-modal-content'),
            // Audio a akční tlačítka
            aiAudioBtn: document.querySelector('.play-tts-btn.ai-audio'),
            prezentaceFixedBtn: document.getElementById('show-prezentace-fixed-btn'),
            pdfFixedBtn: document.getElementById('show-pdf-fixed-btn'),
        },
        state: {
            schedule: [],
            isFinished: false,
        }
    };

    const ObnovaCore = {
        init: function() {
            if (!app.elements.appContainer) {
                console.error('Chyba: Kontejner aplikace #obnova-app-container nebyl nalezen.');
                return;
            }

            if (window.ObnovaMenu) window.ObnovaMenu.init(app.elements);
            if (window.ObnovaAudio) window.ObnovaAudio.init(app.elements);
            if (window.ObnovaPrezentace) window.ObnovaPrezentace.init(app.elements);

            this.setupEventListeners();
            this.run();
        },

        run: function() {
            // ... tato funkce zůstává beze změny ...
            if (typeof obnovaApp === 'undefined' || !obnovaApp.posts) {
                console.error('Chyba: Data aplikace (obnovaApp) nebyla nalezena.');
                return;
            }
            const { posts, sundayPost } = obnovaApp;
            const startDateString = localStorage.getItem('obnovaStartDate');
            if (!startDateString) {
                app.elements.setupOverlay.style.display = 'flex';
                return;
            }
            app.elements.setupOverlay.style.display = 'none';
            const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
            const startDate = new Date(startDateString);
            const today = isPaused ? new Date(localStorage.getItem('obnovaPausedDate')) : new Date();
            startDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);
            const diffTime = today - startDate;
            if (diffTime < 0) {
                app.elements.daysNav.innerHTML = '';
                app.elements.contentContainer.innerHTML = `<p style="text-align:center; padding: 20px;">Vaše obnova ještě nezačala. Začne <strong>${startDate.toLocaleDateString('cs-CZ')}</strong>.</p>`;
                return;
            }
            app.state.schedule = [];
            let postIndex = 0;
            const totalDaysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            for (let i = 0; i <= totalDaysElapsed; i++) {
                const currentDate = new Date(startDate.getTime());
                currentDate.setDate(startDate.getDate() + i);
                if (currentDate.getDay() === 0) {
                    app.state.schedule.push({ type: 'sunday', ...sundayPost });
                } else {
                    if (postIndex < posts.length) {
                        app.state.schedule.push({ type: 'post', ...posts[postIndex] });
                        postIndex++;
                    } else {
                        break;
                    }
                }
            }
            app.state.isFinished = postIndex >= posts.length;
            const activeDayIndex = app.state.schedule.length - 1;
            this.generateDaysNav();
            this.showDay(activeDayIndex);
            if (app.elements.sideMenuDateInput) {
                app.elements.sideMenuDateInput.value = startDateString;
            }
            if (window.ObnovaMenu) window.ObnovaMenu.updatePauseButtonUI();
        },

        showDay: function(index) {
            const item = app.state.schedule[index];
            if (!app.elements.contentContainer || !item) return;

            // Aktualizace tlačítek
            if (window.ObnovaAudio) window.ObnovaAudio.updateFixedControls(item);
            this.updateFixedActionButtons(item, index);

            const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
            const finishedMessage = (app.state.isFinished && index === app.state.schedule.length - 1) ? `<p class="finished-message">Duchovní obnova je u konce.</p>` : '';
            const pausedMessage = isPaused ? `<p class="paused-message">Obnova je pozastavena.</p>` : '';
            
            // ODSTRANĚNO: Tlačítka se již negenerují zde
            // const prezentaceButtonHTML = ...
            // const pdfButtonHTML = ...

            app.elements.contentContainer.innerHTML = `
                <article data-day-index="${index}">
                    ${pausedMessage}${finishedMessage}
                    <h2>${item.title || 'Načítání...'}</h2>
                    <div class="entry-content">${item.content || ''}</div>
                </article>`;

            document.querySelectorAll('.day-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.day-link[data-day-index="${index}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        },

        // NOVÁ FUNKCE: Aktualizace fixních tlačítek (Prezentace, PDF)
        updateFixedActionButtons: function(item, index) {
            const { prezentaceFixedBtn, pdfFixedBtn } = app.elements;

            const hasPrezentace = item.prezentace_embed_src;
            if (prezentaceFixedBtn) {
                prezentaceFixedBtn.style.display = hasPrezentace ? 'flex' : 'none';
                if (hasPrezentace) {
                    prezentaceFixedBtn.dataset.prezentaceSrc = item.prezentace_embed_src;
                }
            }

            const hasPdf = item.pdf_flipbook_html && item.pdf_flipbook_html.trim() !== '';
            if (pdfFixedBtn) {
                pdfFixedBtn.style.display = hasPdf ? 'flex' : 'none';
                if (hasPdf) {
                    pdfFixedBtn.dataset.dayIndex = index;
                }
            }
        },

        openPdfModal: function(dayIndex) {
            const item = app.state.schedule[dayIndex];
            if (!item || !item.pdf_flipbook_html) return;

            app.elements.pdfModalContent.innerHTML = item.pdf_flipbook_html;
            app.elements.pdfModal.style.display = 'flex';
            app.elements.pdfModalOverlay.style.display = 'block';
            document.body.classList.add('modal-is-open');

            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.flipBook !== 'undefined') {
                const newFlipbook = app.elements.pdfModalContent.querySelector('._df_book');
                if (newFlipbook) {
                    jQuery(newFlipbook).flipBook();
                }
            }
        },

        closePdfModal: function() {
            app.elements.pdfModal.style.display = 'none';
            app.elements.pdfModalOverlay.style.display = 'none';
            document.body.classList.remove('modal-is-open');
            app.elements.pdfModalContent.innerHTML = '';
        },

        generateDaysNav: function() {
            // ... tato funkce zůstává beze změny ...
            app.elements.daysNav.innerHTML = app.state.schedule.map((item, index) =>
                `<a href="#" class="day-link" data-day-index="${index}">${item.type === 'sunday' ? 'Neděle' : `Den ${item.day}`}</a>`
            ).join('');
        },
        
        saveAndRun: function(dateValue) {
            // ... tato funkce zůstává beze změny ...
            if (!dateValue) {
                alert('Prosím, zvolte datum začátku.');
                return;
            }
            const selectedDate = new Date(dateValue);
            const today = new Date();
            const limitDate = new Date();
            limitDate.setDate(today.getDate() - 7);
            selectedDate.setHours(0, 0, 0, 0);
            limitDate.setHours(0, 0, 0, 0);
            if (selectedDate < limitDate) {
                alert('Datum začátku nemůže být nastaveno o více než 7 dní v minulosti. Prosím, zvolte jiné datum.');
                return;
            }
            localStorage.setItem('obnovaStartDate', dateValue);
            localStorage.removeItem('obnovaIsPaused');
            localStorage.removeItem('obnovaPausedDate');
            if (app.elements.sideMenuDateInput) app.elements.sideMenuDateInput.value = dateValue;
            if (app.elements.setupDateInput) app.elements.setupDateInput.value = dateValue;
            if (window.ObnovaMenu) window.ObnovaMenu.toggleMenu(false);
            if (window.ObnovaMenu) window.ObnovaMenu.updatePauseButtonUI();
            this.run();
        },

        setupEventListeners: function() {
            document.body.addEventListener('click', (event) => {
                const target = event.target;
                const playBtn = target.closest('.play-tts-btn');
                const dayLink = target.closest('.day-link');
                
                // Zjednodušená delegace, stará tlačítka jsou pryč
                if (dayLink) {
                    event.preventDefault();
                    this.showDay(parseInt(dayLink.dataset.dayIndex, 10));
                } else if (playBtn && window.ObnovaAudio && playBtn.classList.contains('ai-audio')) {
                    event.preventDefault();
                    window.ObnovaAudio.handleAudioPlayback(playBtn);
                }
            });

            // Přidáme posluchače pro nová fixní tlačítka
            app.elements.prezentaceFixedBtn?.addEventListener('click', () => {
                if (window.ObnovaPrezentace) {
                   window.ObnovaPrezentace.openPrezentaceModal(app.elements.prezentaceFixedBtn.dataset.prezentaceSrc);
               }
           });
           app.elements.pdfFixedBtn?.addEventListener('click', () => {
               const dayIndex = app.elements.pdfFixedBtn.dataset.dayIndex;
               this.openPdfModal(parseInt(dayIndex, 10));
           });

            // Posluchače pro zavření modálů
            app.elements.pdfModalCloseBtn?.addEventListener('click', () => this.closePdfModal());
            app.elements.pdfModalOverlay?.addEventListener('click', () => this.closePdfModal());

            // Posluchače pro nastavení
            app.elements.setupBtn?.addEventListener('click', () => this.saveAndRun(app.elements.setupDateInput.value));
            app.elements.settingsBtn?.addEventListener('click', () => this.saveAndRun(app.elements.sideMenuDateInput.value));
        }
    };

    window.ObnovaCore = ObnovaCore;
    document.addEventListener('DOMContentLoaded', () => {
        ObnovaCore.init();
    });
})(window);