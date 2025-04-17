import { Btc1Identifier } from '../../../../src/index.js';
import vectors from '../../../in/did-encode.js';

for(let vector of vectors) {
  const encoded = Btc1Identifier.encode(vector.identifierComponents);
  console.log('encoded', encoded);
  const decoded = Btc1Identifier.decode(encoded);
  console.log('decoded', decoded);
}