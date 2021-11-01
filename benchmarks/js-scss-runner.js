const sass = require('sass');
console.log(sass.renderSync({ file: process.argv[2] }).css.toString());
