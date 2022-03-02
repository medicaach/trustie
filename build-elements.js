const fs = require('fs-extra');
const concat = require('concat');

(async function build() {
  const files = [
    './dist/Trustie/runtime.js',
    './dist/Trustie/polyfills.js',
    //'./dist/Trustie/scripts.js',
    './dist/Trustie/main.js'
  ];

  await fs.ensureDir('elements');
  await fs.ensureDir('./dist/matrix/src')
  await concat(files, 'elements/trustie.js');
  await concat(files, 'dist/matrix/src/trustie.js');
})();
