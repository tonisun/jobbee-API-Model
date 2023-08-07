const fs = require('fs');
const axios = require('axios');

// Pfad zu Ihrer JSON-Datei
const filePath = '../public/test-datas/ITEmployersList.json';

// Liest die JSON-Datei
fs.readFile(filePath, 'utf8', (err, jsonString) => {
    if (err) {
        console.log("Fehler beim Lesen der Datei:", err);
        return;
    }

    try {
        const employers = JSON.parse(jsonString);

        employers.forEach(async (employer) => {
            try {
                const response = await axios.post('http://localhost:3003/api/v1/register', employer);
                console.log('Statuscode:', response.status);
            } catch (error) {
                console.error(`Fehler beim Senden der Daten für ${employer.name}: `, error.message);
            }
        });
    } catch (err) {
        console.log('Fehler beim Parsen der JSON-Datei:', err);
    }
});
