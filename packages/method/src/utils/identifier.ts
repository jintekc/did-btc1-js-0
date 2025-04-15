import { bytesToHex } from '@noble/hashes/utils';
import { bech32m } from '@scure/base';
import { DidError, DidErrorCode } from '@web5/dids';
import { Btc1Networks } from '../types/crud.js';
import { DidComponents } from './appendix.js';
import { Btc1Error, INVALID_DID, METHOD_NOT_SUPPORTED } from '@did-btc1/common';

export class Btc1Identifier {
  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#didbtc1-identifier-encoding | 3.2 did:btc1 Identifier Encoding}.
   *
   * A did:btc1 DID consists of a did:btc1 prefix, followed by an id-bech32 value, which is a Bech32m encoding of:
   *  - the specification version;
   *  - the Bitcoin network identifier; and
   *  - either:
   *    - a key-value representing a secp256k1 public key; or
   *    - a hash-value representing the hash of an initiating external DID document.
   *
   * @param {CreateIdentifierParams} params See {@link CreateIdentifierParams} for details.
   * @param {string} params.idType Identifier type (key or external).
   * @param {number} params.network Bitcoin network name.
   * @param {number} params.version Identifier version.
   * @param {PublicKeyBytes | DocumentBytes} params.genesisBytes Public key or an intermediate document bytes.
   * @returns {string} The new did:btc1 identifier.
   */
  public static encode({ idType, genesisBytes, network, version }: {
    version: number;
    network: string | number;
    idType: string;
    genesisBytes: Uint8Array;
  }): string {
    // 1. If idType is not a valid value per above, raise invalidDid error.
    // 2. If version is greater than 1, raise invalidDid error.
    // 3. If network is not a valid value per above, raise invalidDid error.
    // 4. If network is a number and is outside the range of 1-8, raise invalidDid error.
    // 5. If idType is “key” and genesisBytes is not a valid compressed secp256k1 public key, raise invalidDid error.

    // 6. Map idType to hrp from the following:
    //   6.1 “key” - “k”
    //   6.2 “external” - “x”
    const hrp = idType === 'key' ? 'k' : 'x';

    // 7. Create an empty nibbles numeric array.
    const nibbles: Array<number> = [];

    // 8. Set fCount equal to (version - 1) / 15, rounded down.
    const fCount = Math.floor((version - 1) / 15);

    // 9. Append hexadecimal F (decimal 15) to nibbles fCount times.
    for(let i = 0; i < fCount; i++) {
      nibbles.push(0xf);
    }

    // 10. Append (version - 1) mod 15 to nibbles.
    nibbles.push((version - 1) % 15);

    // 11. If network is a string, append the numeric value from the following map to nibbles:
    //     “bitcoin” - 0
    //     “signet” - 1
    //     “regtest” - 2
    //     “testnet3” - 3
    //     “testnet4” - 4
    if (typeof network === 'string') {
      nibbles.push(Btc1Networks[network as keyof typeof Btc1Networks]);
    } else if (typeof network === 'number') {
      // 12. If network is a number, append network + 7 to nibbles.
      nibbles.push(network + 7);
    }

    // 13. If the number of entries in nibbles is odd, append 0.
    if(nibbles.length % 2 !== 0) {
      nibbles.push(0);
    }

    // 14. Create a dataBytes byte array from nibbles, where index is from 0 to nibbles.length / 2 - 1 and
    //     encodingBytes[index] = (nibbles[2 * index] << 4) | nibbles[2 * index + 1].
    // 15. Set identifier to “did:btc1:”.
    // 16. Pass hrp and dataBytes to the Bech32m Encoding algorithm, retrieving encodedString.
    // 17. Append encodedString to identifier.
    // 18. Return identifier.
    return `did:btc1:${bech32m.encodeFromBytes(hrp, genesisBytes)}`;
  }

  /**
   * Implements {@link https://dcdpr.github.io/did-btc1/#didbtc1-identifier-decoding | 3.3 did:btc1 Identifier Decoding}.
   * @param {string} identifier The BTC1 DID to be parsed
   * @returns {DidComponents} The parsed identifier components
   * @throws {DidError} if an error occurs while parsing the identifier
   * @throws {DidErrorCode.InvalidDid} if identifier is invalid
   * @throws {DidErrorCode.MethodNotSupported} if the method is not supported
   */
  public static decode(identifier: string): DidComponents {
    // 1. Split identifier into an array of components at the colon : character.
    const components = identifier.split(':') ?? [];

    // 2. If the length of the components array is not 3, raise invalidDid error.
    if (components.length !== 3) {
      throw new Btc1Error(`Invalid did: ${identifier}`, INVALID_DID, { identifier });
    }

    // Deconstruct the components of the identifier: scheme, method, fields
    // possible values in `fields`: [id], [{version|network}, id], [version, network, id]
    const [scheme, method, idBech32] = components;

    // 3. If components[0] is not “did”, raise invalidDid error.
    if (!scheme || scheme !== 'did') {
      throw new Btc1Error(`Invalid did scheme: ${scheme}`, INVALID_DID, { identifier });
    }

    // 4. If components[1] is not “btc1”, raise methodNotSupported error.
    if (!method || method !== 'btc1') {
      throw new Btc1Error(`Did Method not supported: ${method}`, METHOD_NOT_SUPPORTED, { identifier });
    }

    // 5. Set encodedString to components[2].
    if (!idBech32) {
      throw new Btc1Error(`Invalid Did: ${identifier}`, INVALID_DID, { identifier });
    }

    // 6. Pass encodedString to the Bech32m Decoding algorithm, retrieving hrp and dataBytes.
    const { prefix: hrp, bytes: dataBytes } = bech32m.decodeToBytes(idBech32);

    // 7. If the Bech32m decoding algorithm fails, raise invalidDid error.
    // 8. Map hrp to idType from the following:
    //    “k” - “key”
    //    “x” - “external”
    //    other - raise invalidDid error
    if (!['x', 'k'].includes(hrp) || !dataBytes) {
      throw new Btc1Error(`Invalid Did: ${identifier}`, INVALID_DID, { identifier });
    }

    // 9. Set version to 1.
    let version = 1;

    // Set the valid idBech32 in identifierComponents object
    const identifierComponents = {
      hrp,
      version,
      network      : 'bitcoin',
      genesisBytes : dataBytes
    } as DidComponents;

    // 10. If at any point in the remaining steps there are not enough nibbles to complete the process, raise invalidDid
    //     error.
    for(let i = 0; i < dataBytes.length; i++) {
      // 11. Start with the first nibble (the higher nibble of the first byte) of dataBytes.
      const nibble = dataBytes[i];

      // 12. Add the value of the current nibble to version.
      version += nibble;

      // 13. If the value of the nibble is hexadecimal F (decimal 15), advance to the next nibble (the lower nibble of
      //     the current byte or the higher nibble of the next byte) and return to the previous step.
      if (nibble === 15) {
        continue;
      }

      // 14. If version is greater than 1, raise invalidDid error.
      if(version > 1) {
        throw new Btc1Error('Invalid version: cannot be > 1', INVALID_DID, { identifier });
      }

      // 15. Advance to the next nibble and set networkValue to its value.
      // 16. Map networkValue to network from the following:
      //     0 - “bitcoin”
      //     1 - “signet”
      //     2 - “regtest”
      //     3 - “testnet3”
      //     4 - “testnet4”
      //     5-7 - raise invalidDid error
      //     8-F - networkValue - 7

      let nextnibble = i + 1;
      const netnibble = dataBytes[nextnibble].toString();
      identifierComponents.network = Btc1Networks[netnibble as keyof typeof Btc1Networks] as unknown as string;

      // 17. If the number of nibbles consumed is odd:
      //     17.1 Advance to the next nibble and set fillerNibble to its value.
      //     17.2 If fillerNibble is not 0, raise invalidDid error.
      if(nextnibble % 2 !== 0) {
        nextnibble += 1;
        const fillerNibble = dataBytes[nextnibble];
        if(fillerNibble !== 0) {
          throw new Btc1Error(`Invalid Did: ${identifier} `, INVALID_DID, { identifier });
        }
      }

      // 18. Set genesisBytes to the remaining dataBytes.
      identifierComponents.genesisBytes = dataBytes.slice(nextnibble);
    }

    // 19. If idType is “key” and genesisBytes is not a valid compressed secp256k1 public key, raise invalidDid error.

    // 20. Return idType, version, network, and genesisBytes.
    return identifierComponents;
  }
}