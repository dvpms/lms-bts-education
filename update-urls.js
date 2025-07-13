const fs = require('fs');

// Read the collection file
const collectionPath = './lms-api-test.postman_collection.json';
let content = fs.readFileSync(collectionPath, 'utf8');

// Replace all localhost:3000 with {{baseUrl}}
content = content.replace(/http:\/\/localhost:3000/g, '{{baseUrl}}');

// Write back to file
fs.writeFileSync(collectionPath, content);

console.log('✅ Updated all URLs in Postman collection to use {{baseUrl}} variable');
