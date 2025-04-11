import { KeyPair } from "@did-btc1/key-pair";
import { Btc1KeyManager } from "../../../method/src/index.js";

const privateKey = new Uint8Array([
  159,  79, 128, 155, 191, 173,  89, 197,
  77, 153,  66, 245, 104,  93, 212, 152,
  14, 174,   1,  99,  18,  32,  32,  87,
  255, 108, 254,  69, 207, 106, 115,  41
]);
console.log('privateKey', privateKey);
const keyPair = new KeyPair({ privateKey });
console.log('keyPair', keyPair);
const keyManager = new Btc1KeyManager({ keys: keyPair });
console.log(keyManager);