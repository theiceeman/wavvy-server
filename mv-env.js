const fs = require('fs');

// Read the .env file
const envData = fs.readFileSync('.env');

// Write the .env file to the build folder
fs.writeFileSync('build/.env', envData);

// node build/ace migration:refresh --force
