<?php
/**
 * Template Name: Moje Poznámky
 * Template Post Type: page
 */

get_header(); // Načte hlavičku
?>

<div id="poznamky-app-container">
    <header class="poznamky-header">
        <h1>Moje poznámky</h1>
    </header>

    <main id="poznamky-content">
        <div class="poznamka-form">
            <label for="poznamka-input">Nová poznámka:</label>
            <textarea id="poznamka-input" rows="6" placeholder="Napište nebo zkopírujte zde svůj text ..."></textarea>
            <button id="save-poznamka-btn">Uložit poznámku</button>
        </div>

        <div class="poznamky-actions">
            <button id="toggle-poznamky-btn">Zobrazit moje poznámky</button>
            <button id="export-poznamky-btn" style="display:none;">Exportovat do .TXT</button>
        </div>

        <div id="poznamky-list-container" style="display:none;">
            </div>
    </main>
</div>

<?php get_footer(); // Načte patičku ?>