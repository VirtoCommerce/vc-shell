const fs = require('fs-extra');
const path = require('path');

fs.copySync(path.resolve(__dirname, './package-modules.json'), 'dist/package.json');
