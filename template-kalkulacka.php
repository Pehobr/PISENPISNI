<?php
/**
 * Template Name: Kalkulačka Obnovy
 * Template Post Type: page
 */

get_header(); // Načte hlavičku
?>

<div id="kalkulacka-app-container">
    <header class="kalkulacka-header">
        <h1>Kdy začít duchovní obnovu?</h1>
        <p>Pokud chcete obnovu ukončit k určitému datu (výročí svatby, narozeniny, svátky), my vám vypočítáme, kdy je třeba začít.</p>
    </header>

    <main id="kalkulacka-content">
        <div class="kalkulacka-form">
            <label for="end-date-input">Chci skončit dne:</label>
            <input type="date" id="end-date-input">
            <button id="calculate-btn">Vypočítat datum začátku</button>
        </div>

        <div id="kalkulacka-vysledek" style="display:none;">
            </div>
    </main>
</div>

<?php get_footer(); // Načte patičku ?>