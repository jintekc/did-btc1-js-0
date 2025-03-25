import { DidBtc1 } from '../../src/did-btc1.js';

const pubKeyBytes = new Uint8Array([
  2, 154, 213, 246, 168,  93,  39, 238,
  105, 177,  51, 174, 210, 115, 180, 242,
  245, 215,  14, 212, 167,  22, 117,   1,
  156,  26, 118, 240,  76, 102,  53,  38,
  239
]);

console.log('Creating BTC1 Identifier with pubKeyBytes:', pubKeyBytes);

const response = await DidBtc1.create({ idType: 'key', pubKeyBytes });
const data = JSON.stringify(response, null, 4);
console.log('Created BTC1 Identifier and Initial Document:', data);