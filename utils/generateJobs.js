const fs = require('fs');
const path = require('path');
const jobGenerator = require('./jobGenerator');

const getNextFileNumber = (dir) => {
    const files = fs.readdirSync(dir);
    const numberedFiles = files.map(file => {
        const match = file.match(/_(\d+)\.json$/);
        return match ? parseInt(match[1], 10) : 0;
    });

    if (!numberedFiles.length) {
        return 1;
    }

    const maxNumber = Math.max(...numberedFiles);
    return maxNumber + 1;
};

const saveJobsToFile = async (NUMBER_OF_JOBS) => {
    try {
        // Generiere Jobs
        const jobs = await jobGenerator(NUMBER_OF_JOBS);

        // Bestimme die nächste Dateinummer
        const dirPath = path.join(__dirname, '..', 'public', 'test-datas');
        const NEXT_FILE_NUMBER = getNextFileNumber(dirPath);

        // Pfad für die Speicherung der JSON-Datei festlegen
        const filePath = path.join(dirPath, `${NUMBER_OF_JOBS}_jobs_for_mongo_${NEXT_FILE_NUMBER.toString().padStart(3, '0')}.json`);

        // Generierte Jobs als JSON in der Datei speichern
        fs.writeFileSync(filePath, JSON.stringify(jobs, null, 4));

        console.log(`Data was written to ${filePath}!`);

    } catch (error) {
        console.error('Fehler beim Speichern der Jobs:', error);
    }
};

saveJobsToFile(10);

