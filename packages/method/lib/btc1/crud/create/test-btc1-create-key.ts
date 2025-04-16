// import { KeyPair } from '@did-btc1/key-pair';
// import { DidBtc1 } from '../../../../src/did-btc1.js';
import { Btc1Identifier } from '../../../../src/index.js';

// const privateKey = new Uint8Array([
//   219, 162, 77, 8, 189, 162, 226, 24,
//   210, 99, 31, 215, 110, 99, 133, 25,
//   187, 22, 25, 43, 179, 218, 59, 39,
//   193, 30, 226, 128, 175, 38, 57, 74
// ]);
// const keyPair = new KeyPair({ privateKey });
// console.log('Creating BTC1 Identifier with keyPair:', keyPair);

// const response = await DidBtc1.create({
//   idType: 'key',
//   pubKeyBytes: keyPair.publicKey.bytes,
//   options: { network: 'regtest' }
// });
const genesisBytes = Buffer.from('02be8aa46e14038248c5cb6fd744a9f186de440344634b7bef02e830b0e2e90826', 'hex');
console.log('genesisBytes', genesisBytes);
const id = Btc1Identifier.encode({
  version : 1,
  network : 'bitcoin',
  idType  : 'KEY',
  genesisBytes
});
console.log('id', id);
// Btc1Identifier.decode(id);
// const data = JSON.stringify(response, null, 4);
// console.log('Created BTC1 Identifier and Initial Document:', data);