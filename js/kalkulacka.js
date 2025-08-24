/**
 * Skript pro kalkulačku data začátku duchovní obnovy (verze 1.0.0)
 */
document.addEventListener('DOMContentLoaded', function() {
    const endDateInput = document.getElementById('end-date-input');
    const calcBtn = document.getElementById('calculate-btn');
    const resultDiv = document.getElementById('kalkulacka-vysledek');

    if (!calcBtn || typeof kalkulackaData === 'undefined') {
        return; // Pokud chybí tlačítko nebo data, nic neděláme
    }

    calcBtn.addEventListener('click', function() {
        const endDateValue = endDateInput.value;
        if (!endDateValue) {
            alert('Prosím, zvolte datum ukončení.');
            return;
        }

        const totalPosts = kalkulackaData.postCount;
        const endDate = new Date(endDateValue);
        
        let currentDate = new Date(endDate.getTime());
        let workdaysNeeded = totalPosts;
        let sundaysCount = 0;

        // Začneme odpočítávat dny, dokud nenaplníme všechny příspěvky
        while (workdaysNeeded > 0) {
            // Zjistíme, jestli je den před aktuálním datem neděle
            let dayBefore = new Date(currentDate.getTime());
            dayBefore.setDate(dayBefore.getDate() - 1);
            
            // getDay() vrací 0 pro neděli, 1 pro pondělí, atd.
            if (dayBefore.getDay() === 0) {
                sundaysCount++;
            } else {
                workdaysNeeded--;
            }
            // Posuneme se o den zpět
            currentDate = dayBefore;
        }

        // Výsledný 'currentDate' je datum, kdy se má začít
        const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
        const formattedStartDate = currentDate.toLocaleDateString('cs-CZ', options);

        resultDiv.innerHTML = `
            <p>Pro dokončení obnovy <strong>${endDate.toLocaleDateString('cs-CZ')}</strong> je potřeba začít:</p>
            <h2><strong>${formattedStartDate}</strong></h2>
            <p class="summary">Během této doby proběhne celkem <strong>${totalPosts}</strong> dnů obnovy a <strong>${sundaysCount}</strong> nedělí.</p>
        `;
        resultDiv.style.display = 'block';
    });
});