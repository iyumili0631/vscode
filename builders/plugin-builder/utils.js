"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tsNodeRegister = void 0;
/**
 * check for TS node registration
 * @param file: file name or file directory are allowed
 * @todo tsNodeRegistration: require ts-node if file extension is TypeScript
 */
function tsNodeRegister(file = '') {
    if (file && file.endsWith('.ts')) {
        // Register TS compiler lazily
        require('ts-node').register({
            compilerOptions: {
                module: 'commonjs',
            },
        });
    }
}
exports.tsNodeRegister = tsNodeRegister;
