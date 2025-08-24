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
            prezentaceModal: document.getElementById('prezentace-modal'),
            modalOverlay: document.getElementById('modal-overlay'),
            modalCloseBtn: document.getElementById('modal-close-btn'),
            modalIframe: document.querySelector('#prezentace-modal iframe'),
            humanAudioBtn: document.querySelector('.play-tts-btn.human-audio'),
            aiAudioBtn: document.querySelector('.play-tts-btn.ai-audio'),
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

            // Inicializace pod-modulů s předáním app.elements
            if (window.ObnovaMenu) window.ObnovaMenu.init(app.elements);
            if (window.ObnovaAudio) window.ObnovaAudio.init(app.elements);
            if (window.ObnovaPrezentace) window.ObnovaPrezentace.init(app.elements);

            this.setupEventListeners();
            this.run();
        },

        run: function() {
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
                if (currentDate.getDay() === 0) { // Neděle
                    app.state.schedule.push({ type: 'sunday', ...sundayPost });
                } else { // Pracovní den
                    if (postIndex < posts.length) {
                        app.state.schedule.push({ type: 'post', ...posts[postIndex] });
                        postIndex++;
                    } else {
                        break; // Všechny příspěvky zpracovány
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

            if (window.ObnovaAudio) window.ObnovaAudio.updateFixedControls(item);

            const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
            const finishedMessage = (app.state.isFinished && index === app.state.schedule.length - 1) ? `<p class="finished-message">Duchovní obnova je u konce.</p>` : '';
            const pausedMessage = isPaused ? `<p class="paused-message">Obnova je pozastavena.</p>` : '';
            const prezentaceButtonHTML = item.prezentace_embed_src ? `<button class="show-prezentace-btn" data-prezentace-src="${item.prezentace_embed_src}"><i class="fas fa-chalkboard-teacher"></i>Zobrazit prezentaci</button>` : '';

            let pdfButtonHTML = '';
            if (item.pdf_flipbook_html) {
                pdfButtonHTML = `
                    <button class="show-pdf-btn" data-day-index="${index}">
                        <i class="fas fa-file-pdf"></i> Zobrazit PDF
                    </button>
                    <div class="pdf-container" id="pdf-container-${index}" style="display:none; margin-top: 20px;">
                        ${item.pdf_flipbook_html}
                    </div>
                `;
            }

            app.elements.contentContainer.innerHTML = `
                <article data-day-index="${index}">
                    ${pausedMessage}${finishedMessage}
                    <h2>${item.title || 'Načítání...'}</h2>
                    <div class="entry-content">${item.content || ''}</div>
                    ${prezentaceButtonHTML}
                    ${pdfButtonHTML}
                </article>`;

            // Po vložení nového obsahu musíme znovu inicializovat DearFlip plugin.
            if (typeof jQuery !== 'undefined' && typeof jQuery.fn.flipBook !== 'undefined') {
                // OPRAVA ZDE: Cílíme na třídu '_df_book', kterou má flipbook hned po vložení.
                const newFlipbook = app.elements.contentContainer.querySelector('._df_book:not(.dflip-initialized)');
                if (newFlipbook) {
                    jQuery(newFlipbook).flipBook();
                    jQuery(newFlipbook).addClass('dflip-initialized');
                }
            }

            document.querySelectorAll('.day-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.day-link[data-day-index="${index}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        },

        generateDaysNav: function() {
            app.elements.daysNav.innerHTML = app.state.schedule.map((item, index) =>
                `<a href="#" class="day-link" data-day-index="${index}">${item.type === 'sunday' ? 'Neděle' : `Den ${item.day}`}</a>`
            ).join('');
        },
        
        saveAndRun: function(dateValue) {
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
                const prezentaceBtn = target.closest('.show-prezentace-btn');
                const dayLink = target.closest('.day-link');
                const pdfBtn = target.closest('.show-pdf-btn');

                if (dayLink) {
                    event.preventDefault();
                    this.showDay(parseInt(dayLink.dataset.dayIndex, 10));
                } else if (playBtn && window.ObnovaAudio) {
                    event.preventDefault();
                    window.ObnovaAudio.handleAudioPlayback(playBtn);
                } 
                else if (pdfBtn) {
                    event.preventDefault();
                    const dayIndex = pdfBtn.dataset.dayIndex;
                    const pdfContainer = document.getElementById(`pdf-container-${dayIndex}`);
                    if (pdfContainer) {
                        const isHidden = pdfContainer.style.display === 'none';
                        pdfContainer.style.display = isHidden ? 'block' : 'none';
                    }
                } 
                else if (prezentaceBtn && window.ObnovaPrezentace) {
                    event.preventDefault();
                    window.ObnovaPrezentace.openPrezentaceModal(prezentaceBtn.dataset.prezentaceSrc);
                }
            });

            app.elements.setupBtn?.addEventListener('click', () => this.saveAndRun(app.elements.setupDateInput.value));
            app.elements.settingsBtn?.addEventListener('click', () => this.saveAndRun(app.elements.sideMenuDateInput.value));
        }
    };

    window.ObnovaCore = ObnovaCore;
    document.addEventListener('DOMContentLoaded', () => {
        ObnovaCore.init();
    });
})(window);
