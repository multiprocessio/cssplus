const { transform } = require('cssplus');
const fs = require('fs');

const f = fs.readFileSync(process.argv[2]).toString();
console.log(transform(f));
