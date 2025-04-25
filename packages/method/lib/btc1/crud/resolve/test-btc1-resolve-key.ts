import { DidBtc1 } from '../../../../src/did-btc1.js';
import options from '../../../in/external/resolutionOptions.json' with { type: 'json' };

const resolution = await DidBtc1.resolve('did:btc1:x1qtdr376lhfvyxe466n67kyl2hzdxeh59z3axv4ud5jsxul75xac0yyrwykt', options);
console.log('Resolution Result:', resolution);