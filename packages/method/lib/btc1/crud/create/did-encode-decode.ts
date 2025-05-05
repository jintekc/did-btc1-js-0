import { bytesToHex } from '@noble/hashes/utils';
import { Btc1Identifier } from '../../../../src/index.js';
import vectors from '../../../in/encode-decode.js';
import { Logger } from '@did-btc1/common';

for(let {did, identifierComponents: idcomps} of vectors) {
  Logger.log('Encoding', idcomps);
  const encoded = Btc1Identifier.encode(idcomps);
  if(encoded !== did){
    console.log(`encoded ${encoded} !== did ${did}`);
  }

  Logger.log('Decoding', encoded);
  const {version, network, genesisBytes} = Btc1Identifier.decode(encoded);
  console.log('genesisBytes', genesisBytes);
  if(version !== idcomps.version) {
    console.log(`decoded.version ${version} !== ${idcomps.version}`);
  }
  if(network !== idcomps.network) {
    console.log(`decoded.network ${network} === ${idcomps.network}`);
  }

  if(bytesToHex(genesisBytes) !== bytesToHex(idcomps.genesisBytes)) {
    console.log(`decoded.genesisBytes ${bytesToHex(genesisBytes)} !== ${bytesToHex(idcomps.genesisBytes)}`);
  }
  console.log('\n--------------------------------------------------');
}