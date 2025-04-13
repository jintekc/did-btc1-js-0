[**@did-btc1/key-pair v0.4.6**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / IKeyPair

# Interface: IKeyPair

Defined in: [interface.ts:162](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/interface.ts#L162)

Interface for class KeyPair.
 IKeyPair

## Properties

### privateKey?

> `readonly` `optional` **privateKey**: [`PrivateKey`](../classes/PrivateKey.md)

Defined in: [interface.ts:173](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/interface.ts#L173)

#### Throws

If the private key is not available.

***

### publicKey

> `readonly` **publicKey**: [`PublicKey`](../classes/PublicKey.md)

Defined in: [interface.ts:166](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/interface.ts#L166)

## Methods

### json()

> **json**(): `KeyPairJSON`

Defined in: [interface.ts:180](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/interface.ts#L180)

JSON representation of a KeyPair object.

#### Returns

`KeyPairJSON`

The key pair as a JSON object.
