const fs = require("fs");
const { transform } = require("../dist/");

const input = fs.readFileSync(process.argv[2]).toString();
console.log(transform(input));
