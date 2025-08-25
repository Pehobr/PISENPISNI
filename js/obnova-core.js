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
            // Elementy pro modál PDF
            pdfModal: document.getElementById('pdf-modal'),
            pdfModalOverlay: document.getElementById('pdf-modal-overlay'),
            pdfModalCloseBtn: document.getElementById('pdf-modal-close-btn'),
            pdfModalContent: document.getElementById('pdf-modal-content'),
            // Audio a akční tlačítka
            aiAudioBtn: document.querySelector('.play-tts-btn.ai-audio'),
            prezentaceFixedBtn: document.getElementById('show-prezentace-fixed-btn'),
            pdfFixedBtn: document.getElementById('show-pdf-fixed-btn'),
            // NOVÉ: Elementy pro výběr typu obnovy
            initialTypeSelectors: document.querySelectorAll('input[name="initial_obnova_type"]'),
            menuTypeSelectors: document.querySelectorAll('input[name="menu_obnova_type"]'),
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
            if (typeof obnovaApp === 'undefined' || !obnovaApp.posts) {
                console.error('Chyba: Data aplikace (obnovaApp) nebyla nalezena.');
                return;
            }
            
            const startDateString = localStorage.getItem('obnovaStartDate');
            const obnovaType = localStorage.getItem('obnovaType') || 'full'; // Načteme typ, výchozí je 'full'

            // Synchronizujeme UI přepínače podle uložené hodnoty
            this.syncTypeSelectors(obnovaType);

            if (!startDateString) {
                app.elements.setupOverlay.style.display = 'flex';
                return;
            }
            app.elements.setupOverlay.style.display = 'none';
            
            // === ZMĚNA ZAČÍNÁ ZDE: Rozšířená logika filtrování ===
            let filteredPosts;
            switch (obnovaType) {
                case 'lent':
                    // Postní obnova: Všechny příspěvky KROMĚ úvodu a závěru
                    filteredPosts = obnovaApp.posts.filter(post => 
                        !post.tags.includes('uvod') && !post.tags.includes('zaver')
                    );
                    break;
                case 'bible':
                    // Biblická obnova: POUZE příspěvky s tagem 'uvod'
                    filteredPosts = obnovaApp.posts.filter(post => 
                        post.tags.includes('uvod')
                    );
                    break;
                case 'cinderella':
                    // Popelka nazaretská: POUZE příspěvky s tagem 'zaver'
                    filteredPosts = obnovaApp.posts.filter(post => 
                        post.tags.includes('zaver')
                    );
                    break;
                case 'full':
                default:
                    // Plná obnova: Všechny příspěvky
                    filteredPosts = obnovaApp.posts;
                    break;
            }
            // === ZMĚNA KONČÍ ZDE ===
            
            const { sundayPost } = obnovaApp;
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
            let displayDayCounter = 1; 
            const totalDaysElapsed = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            for (let i = 0; i <= totalDaysElapsed; i++) {
                const currentDate = new Date(startDate.getTime());
                currentDate.setDate(startDate.getDate() + i);
                if (currentDate.getDay() === 0) {
                    app.state.schedule.push({ type: 'sunday', ...sundayPost });
                } else {
                    if (postIndex < filteredPosts.length) {
                        const postItem = { 
                            type: 'post', 
                            ...filteredPosts[postIndex], 
                            displayDay: displayDayCounter 
                        };
                        app.state.schedule.push(postItem);
                        postIndex++;
                        displayDayCounter++;
                    } else {
                        break;
                    }
                }
            }
            app.state.isFinished = postIndex >= filteredPosts.length;
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
            this.updateFixedActionButtons(item, index);

            if (item.type === 'sunday') {
                let sundayContentHTML = `
                    <article data-day-index="${index}">
                        <h2>${item.title || 'Nedělní ohlédnutí'}</h2>
                        <div class="entry-content">
                            <p style="text-align: center; font-style: italic;">Inspirace, které nás provázely uplynulým týdnem:</p>
                            <div class="sunday-summary">
                `;

                const startIndex = Math.max(0, index - 6);
                const weekDays = app.state.schedule.slice(startIndex, index);
                let inspirationFound = false;

                weekDays.forEach(dayItem => {
                    if (dayItem.type === 'post') {
                        const inspirationHtml = this.extractInspiration(dayItem.content);
                        if (inspirationHtml) {
                            inspirationFound = true;
                            sundayContentHTML += `
                                <div class="summary-item">
                                    <h4>Den ${dayItem.displayDay}: ${dayItem.title}</h4>
                                    <div>${inspirationHtml}</div>
                                </div>
                            `;
                        }
                    }
                });

                if (!inspirationFound) {
                    sundayContentHTML += '<p style="text-align: center;">Pro tento týden nebyly nalezeny žádné inspirace.</p>';
                }

                sundayContentHTML += `
                            </div>
                        </div>
                    </article>
                `;
                app.elements.contentContainer.innerHTML = sundayContentHTML;
            } else {
                const isPaused = localStorage.getItem('obnovaIsPaused') === 'true';
                const finishedMessage = (app.state.isFinished && index === app.state.schedule.length - 1) ? `<p class="finished-message">Duchovní obnova je u konce.</p>` : '';
                const pausedMessage = isPaused ? `<p class="paused-message">Obnova je pozastavena.</p>` : '';
                
                app.elements.contentContainer.innerHTML = `
                    <article data-day-index="${index}">
                        ${pausedMessage}${finishedMessage}
                        <h2>${item.title || 'Načítání...'}</h2>
                        <div class="entry-content">${item.content || ''}</div>
                    </article>`;
            }

            document.querySelectorAll('.day-link').forEach(link => link.classList.remove('active'));
            const activeLink = document.querySelector(`.day-link[data-day-index="${index}"]`);
            if (activeLink) {
                activeLink.classList.add('active');
                activeLink.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        },
        
        extractInspiration: function(htmlContent) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlContent;
            const accordionItems = tempDiv.querySelectorAll('.accordion-item');
            for (const item of accordionItems) {
                const button = item.querySelector('.accordion-toggle');
                if (button && button.textContent.trim() === 'Inspirace') {
                    const hiddenTextDiv = item.querySelector('.hidden-text');
                    if (hiddenTextDiv) {
                        const contentClone = hiddenTextDiv.cloneNode(true);
                        const hr = contentClone.querySelector('hr');
                        if (hr) hr.remove();
                        return contentClone.innerHTML.trim();
                    }
                }
            }
            return null;
        },

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
            app.elements.daysNav.innerHTML = app.state.schedule.map((item, index) =>
                `<a href="#" class="day-link" data-day-index="${index}">${item.type === 'sunday' ? 'Neděle' : `Den ${item.displayDay}`}</a>`
            ).join('');
        },
        
        saveAndRun: function(dateValue, typeValue) {
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
            localStorage.setItem('obnovaType', typeValue);
            localStorage.removeItem('obnovaIsPaused');
            localStorage.removeItem('obnovaPausedDate');
            if (app.elements.sideMenuDateInput) app.elements.sideMenuDateInput.value = dateValue;
            if (app.elements.setupDateInput) app.elements.setupDateInput.value = dateValue;
            this.syncTypeSelectors(typeValue);
            if (window.ObnovaMenu) window.ObnovaMenu.toggleMenu(false);
            if (window.ObnovaMenu) window.ObnovaMenu.updatePauseButtonUI();
            this.run();
        },

        syncTypeSelectors: function(type) {
            app.elements.initialTypeSelectors.forEach(radio => {
                radio.checked = radio.value === type;
            });
            app.elements.menuTypeSelectors.forEach(radio => {
                radio.checked = radio.value === type;
            });
        },

        setupEventListeners: function() {
            document.body.addEventListener('click', (event) => {
                const target = event.target;
                const playBtn = target.closest('.play-tts-btn');
                const dayLink = target.closest('.day-link');
                
                if (dayLink) {
                    event.preventDefault();
                    this.showDay(parseInt(dayLink.dataset.dayIndex, 10));
                } else if (playBtn && window.ObnovaAudio && playBtn.classList.contains('ai-audio')) {
                    event.preventDefault();
                    window.ObnovaAudio.handleAudioPlayback(playBtn);
                }
            });

            app.elements.prezentaceFixedBtn?.addEventListener('click', () => {
                if (window.ObnovaPrezentace) {
                   window.ObnovaPrezentace.openPrezentaceModal(app.elements.prezentaceFixedBtn.dataset.prezentaceSrc);
               }
           });
           app.elements.pdfFixedBtn?.addEventListener('click', () => {
               const dayIndex = app.elements.pdfFixedBtn.dataset.dayIndex;
               this.openPdfModal(parseInt(dayIndex, 10));
           });

            app.elements.pdfModalCloseBtn?.addEventListener('click', () => this.closePdfModal());
            app.elements.pdfModalOverlay?.addEventListener('click', () => this.closePdfModal());

            app.elements.setupBtn?.addEventListener('click', () => {
                const selectedType = document.querySelector('input[name="initial_obnova_type"]:checked').value;
                this.saveAndRun(app.elements.setupDateInput.value, selectedType);
            });
            app.elements.settingsBtn?.addEventListener('click', () => {
                const selectedType = document.querySelector('input[name="menu_obnova_type"]:checked').value;
                this.saveAndRun(app.elements.sideMenuDateInput.value, selectedType);
            });
        }
    };

    window.ObnovaCore = ObnovaCore;
    document.addEventListener('DOMContentLoaded', () => {
        ObnovaCore.init();
    });
})(window);
