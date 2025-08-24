// js/obnova-prezentace.js

(function(window) {
    const ObnovaPrezentace = {
        appElements: null, // Bude nastaveno z obnova-core.js

        init: function(elements) {
            this.appElements = elements;
            this.setupEventListeners();
        },

        openPrezentaceModal: function(src) {
            const { modalIframe, prezentaceModal, modalOverlay } = this.appElements;
            if (modalIframe && src) {
                modalIframe.src = src;
                prezentaceModal.style.display = 'block';
                modalOverlay.style.display = 'block';
                document.body.classList.add('modal-is-open');
                document.documentElement.classList.add('modal-is-open');
            }
        },
        
        closePrezentaceModal: function() {
            const { modalIframe, prezentaceModal, modalOverlay } = this.appElements;
            if (modalIframe) modalIframe.src = 'about:blank';
            if (prezentaceModal) prezentaceModal.style.display = 'none';
            if (modalOverlay) modalOverlay.style.display = 'none';
            document.body.classList.remove('modal-is-open');
            document.documentElement.classList.remove('modal-is-open');
        },

        setupEventListeners: function() {
            this.appElements.modalCloseBtn?.addEventListener('click', () => this.closePrezentaceModal());
            this.appElements.modalOverlay?.addEventListener('click', () => this.closePrezentaceModal());
        }
    };

    window.ObnovaPrezentace = ObnovaPrezentace;
})(window);