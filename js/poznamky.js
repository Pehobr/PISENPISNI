/**
 * Skript pro funkcionalitu poznámek (verze 1.3 - Mobilní export)
 * * Změny:
 * - Na mobilních zařízeních se export změní na "Kopírovat do schránky".
 * - Na desktopu zůstává stahování .txt souboru.
 */
document.addEventListener('DOMContentLoaded', function() {
    
    const poznamkyContainer = document.getElementById('poznamky-app-container');
    if (!poznamkyContainer) {
        return;
    }

    const saveBtn = document.getElementById('save-poznamka-btn');
    const toggleBtn = document.getElementById('toggle-poznamky-btn');
    const exportBtn = document.getElementById('export-poznamky-btn');
    const textarea = document.getElementById('poznamka-input');
    const listContainer = document.getElementById('poznamky-list-container');
    const storageKey = 'mojeDuchovniPoznamky';

    if (!saveBtn || !toggleBtn || !exportBtn || !textarea || !listContainer) {
        console.error('Chyba: Některý z požadovaných HTML prvků pro poznámky nebyl nalezen.');
        return;
    }

    // --- NOVÁ FUNKCE: Detekce mobilního zařízení ---
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Pokud jsme na mobilu, změníme text tlačítka
    if (isMobile) {
        exportBtn.textContent = 'Kopírovat poznámky';
    }

    /**
     * Načte poznámky z localStorage a zobrazí je.
     */
    function displayNotes() {
        const notes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        listContainer.innerHTML = '';

        if (notes.length === 0) {
            listContainer.innerHTML = '<p>Zatím zde nemáte žádné poznámky.</p>';
            exportBtn.style.display = 'none';
            return;
        }

        notes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        notes.forEach(note => {
            const noteEl = document.createElement('div');
            noteEl.className = 'poznamka-item';
            
            noteEl.innerHTML = `
                <button class="delete-poznamka-btn" data-timestamp="${note.timestamp}" title="Smazat poznámku">&times;</button>
                <div class="poznamka-text">${note.text.replace(/\n/g, '<br>')}</div>
            `;
            listContainer.appendChild(noteEl);
        });

        exportBtn.style.display = 'inline-block';
    }

    /**
     * Uloží novou poznámku.
     */
    function saveNote() {
        const text = textarea.value.trim();
        if (text === '') {
            alert('Pole pro poznámku je prázdné.');
            return;
        }

        const notes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const newNote = {
            timestamp: new Date().toISOString(),
            text: text
        };

        notes.push(newNote);
        localStorage.setItem(storageKey, JSON.stringify(notes));

        textarea.value = '';
        alert('Poznámka byla uložena.');
        
        if (listContainer.style.display === 'block') {
            displayNotes();
        }
    }

    /**
     * Smaže vybranou poznámku pomocí jejího časového razítka.
     */
    function deleteNote(timestampToDelete) {
        if (!confirm('Opravdu si přejete smazat tuto poznámku?')) {
            return;
        }

        let notes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        notes = notes.filter(note => note.timestamp !== timestampToDelete);
        
        localStorage.setItem(storageKey, JSON.stringify(notes));
        displayNotes();
    }

    /**
     * Exportuje poznámky (buď do schránky na mobilu, nebo jako soubor na desktopu)
     */
    function exportNotes() {
        const notes = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (notes.length === 0) {
            alert('Není co exportovat.');
            return;
        }

        notes.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        let fileContent = "Moje poznámky z duchovní obnovy\n";
        fileContent += "=================================\n\n";

        notes.forEach(note => {
            fileContent += `${note.text}\n\n`;
        });

        // --- Rozlišení logiky pro mobil a desktop ---
        if (isMobile) {
            // --- Logika pro mobilní zařízení (Kopírovat do schránky) ---
            navigator.clipboard.writeText(fileContent).then(function() {
                alert('Poznámky zkopírovány do schránky!');
            }, function(err) {
                alert('Chyba při kopírování do schránky.');
                console.error('Chyba při kopírování: ', err);
            });
        } else {
            // --- Původní logika pro desktop (Stáhnout soubor) ---
            const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'moje-poznamky.txt';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    // Přiřazení událostí k tlačítkům
    saveBtn.addEventListener('click', saveNote);
    exportBtn.addEventListener('click', exportNotes); // Změna na novou funkci

    toggleBtn.addEventListener('click', () => {
        const isHidden = listContainer.style.display === 'none';
        if (isHidden) {
            displayNotes();
            listContainer.style.display = 'block';
            toggleBtn.textContent = 'Skrýt moje poznámky';
        } else {
            listContainer.style.display = 'none';
            toggleBtn.textContent = 'Zobrazit moje poznámky';
        }
    });

    listContainer.addEventListener('click', function(event) {
        if (event.target.classList.contains('delete-poznamka-btn')) {
            const timestamp = event.target.getAttribute('data-timestamp');
            deleteNote(timestamp);
        }
    });
});