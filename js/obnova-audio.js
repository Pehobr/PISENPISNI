// js/obnova-audio.js

(function(window) {
    const ObnovaAudio = {
        appElements: null, // Bude nastaveno z obnova-core.js
        currentAudio: new Audio(),
        currentPlayBtn: null,

        init: function(elements) {
            this.appElements = elements;
            this.setupEventListeners();
        },

        handleAudioPlayback: function(playBtn) {
            const audioSrc = playBtn.dataset.audioSrc;
            if (!audioSrc) return;

            if (this.currentPlayBtn === playBtn && !this.currentAudio.paused) {
                this.currentAudio.pause();
            } else {
                if (this.currentPlayBtn && this.currentPlayBtn !== playBtn) {
                    this.currentAudio.pause();
                }
                this.currentAudio.src = audioSrc;
                this.currentAudio.play().catch(e => console.error("Chyba přehrávání:", e));
                this.currentPlayBtn = playBtn;
            }
        },

        updateFixedControls: function(item) {
            const { humanAudioBtn, aiAudioBtn } = this.appElements;

            const hasHumanAudio = item.type === 'post' && item.audio_url;
            if (humanAudioBtn) {
                humanAudioBtn.style.display = hasHumanAudio ? 'flex' : 'none';
                if (hasHumanAudio) humanAudioBtn.dataset.audioSrc = item.audio_url;
            }
            
            const hasAiAudio = item.type === 'post' && item.ai_audio_url;
            if (aiAudioBtn) {
                aiAudioBtn.style.display = hasAiAudio ? 'flex' : 'none';
                if (hasAiAudio) aiAudioBtn.dataset.audioSrc = item.ai_audio_url;
            }

            if (this.currentPlayBtn && !this.currentAudio.paused) {
                const activeSrc = this.currentPlayBtn.dataset.audioSrc;
                if (activeSrc !== item.audio_url && activeSrc !== item.ai_audio_url) {
                    this.currentAudio.pause();
                }
            }
        },

        handleAudioPlaying: function() {
            if (this.currentPlayBtn) {
                this.currentPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                this.currentPlayBtn.classList.add('playing');
            }
        },

        handleAudioPause: function() {
            if (this.currentPlayBtn) {
                this.currentPlayBtn.innerHTML = this.currentPlayBtn.classList.contains('ai-audio') ? 'AI&nbsp;&nbsp;<i class="fas fa-headphones-alt"></i>' : '<i class="fas fa-headphones-alt"></i>';
                this.currentPlayBtn.classList.remove('playing');
            }
        },
        
        handleAudioEnded: function() {
            this.handleAudioPause();
            this.currentPlayBtn = null;
        },

        setupEventListeners: function() {
            this.currentAudio.onplaying = () => this.handleAudioPlaying();
            this.currentAudio.onpause = () => this.handleAudioPause();
            this.currentAudio.onended = () => this.handleAudioEnded();
        }
    };

    window.ObnovaAudio = ObnovaAudio;
})(window);