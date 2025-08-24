<?php
/**
 * Template Name: Duchovní Obnova Aplikace
 * Template Post Type: page
 */

get_header(); // Načte hlavičku vaší šabloně
?>

<div id="obnova-app-container">

    <div id="initial-setup-overlay">
        <div id="initial-setup-box">
            <h2>Duchovní obnova</h2>
            <a href="https://pisenpisni.audiokatechismus.cz/informace-o-obnove/" class="info-link">Podrobnosti</a>
            <p>Zvolte si, od kterého dne chcete obnovu začít.</p>
            <label for="initial-start-date">Datum začátku obnovy:</label>
            <input type="date" id="initial-start-date">
            <button id="initial-save-btn">Nastavit datum</button>
        </div>
    </div>

    <aside id="side-menu">
        <div class="side-menu-header">
            <h4>Menu</h4>
            <button id="close-menu-btn" aria-label="Zavřít menu">&times;</button>
        </div>
        <div class="side-menu-content">
            <div id="settings">
                <h5>Nastavení data</h5>
                <label for="start-date-input">Datum začátku obnovy:</label>
                <input type="date" id="start-date-input">
                <button id="save-settings-btn">Uložit a načíst</button>
                <p id="settings-saved-msg" class="feedback-msg" style="display:none;">Nastavení uloženo!</p>
            </div>
            <div id="pause-control">
                <h5>Ovládání obnovy</h5>
                <button id="pause-resume-btn">Pozastavit obnovu</button>
                <p id="pause-feedback-msg" class="feedback-msg" style="display:none;"></p>
            </div>
        </div>
    </aside>

    <div id="main-content">
        <header class="app-header">
            <h1>Duchovní obnova</h1>
            <button id="menu-toggle-btn" aria-label="Otevřít menu">☰</button>
        </header>
        <nav id="days-nav" class="days-nav-bar"></nav>
        <main id="content-container"></main>
    </div>
    
</div>

<div id="app-overlay"></div>

<!-- Modální okno pro Prezentaci -->
<div id="prezentace-modal" style="display: none;">
    <button id="modal-close-btn" title="Zavřít prezentaci">&times;</button>
    <div id="modal-content">
        <iframe src="" allow="fullscreen" title="Prezentace"></iframe>
    </div>
</div>
<div id="modal-overlay" style="display: none;"></div>

<!-- NOVÉ: Modální okno pro PDF -->
<div id="pdf-modal" style="display: none;">
    <button id="pdf-modal-close-btn" title="Zavřít PDF">&times;</button>
    <div id="pdf-modal-content">
        <!-- Obsah PDF se vloží sem pomocí JavaScriptu -->
    </div>
</div>
<div id="pdf-modal-overlay" style="display: none;"></div>


<button class="play-tts-btn human-audio" style="display: none;" title="Přehrát nahlas"><i class="fas fa-headphones-alt"></i></button>
<button class="play-tts-btn ai-audio" style="display: none;" title="Přehrát AI hlasem">AI&nbsp;&nbsp;<i class="fas fa-headphones-alt"></i></button>


<?php get_footer(); // Načte patičku vaší šablony ?>
