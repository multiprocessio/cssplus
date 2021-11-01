const sass = require('node-sass');
console.log(sass.renderSync({ file: process.argv[2] }).css.toString());
