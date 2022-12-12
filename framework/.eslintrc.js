const { resolve } = require('path');

module.exports = {
    settings: {
        'import/resolver': {
            typescript: {
                project: resolve(__dirname, 'tsconfig.json'),
            },
        },
    },
};
