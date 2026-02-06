const fs = require('fs');
const path = require('path');

// Path to the file where the placeholder needs to be replaced
const filePath = path.join(__dirname, 'kidsportal', 'wwwroot', 'JS', 'abonnement.js');

// Placeholder and the actual key
const placeholder = 'FUNCTION_APP_KEY_PLACEHOLDER';
const actualKey = process.env.FUNCTION_APP_KEY; // Ensure this is set in the environment

if (!actualKey) {
    console.error('FUNCTION_APP_KEY is not set in the environment.');
    process.exit(1);
}

// Read the file, replace the placeholder, and write back
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading the file:', err);
        process.exit(1);
    }

    if (!data.includes(placeholder)) {
        console.error('Placeholder not found in the file.');
        process.exit(1);
    }

    const updatedData = data.replace(placeholder, actualKey);

    fs.writeFile(filePath, updatedData, 'utf8', (err) => {
        if (err) {
            console.error('Error writing the file:', err);
            process.exit(1);
        }
        console.log('Placeholder replaced successfully.');
    });
});