[**@did-btc1/key-pair v0.4.6**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / KeyPairUtils

# Class: KeyPairUtils

Defined in: [key-pair.ts:105](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L105)

Utility class for creating and working with KeyPair objects.
 KeyPairUtils

## Constructors

### Constructor

> **new KeyPairUtils**(): `KeyPairUtils`

#### Returns

`KeyPairUtils`

## Methods

### equals()

> `static` **equals**(`keyPair`, `otherKeyPair`): `boolean`

Defined in: [key-pair.ts:160](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L160)

Compares two KeyPair objects for equality.

#### Parameters

##### keyPair

[`KeyPair`](KeyPair.md)

The main keyPair.

##### otherKeyPair

[`KeyPair`](KeyPair.md)

The other keyPair.

#### Returns

`boolean`

True if the public key and private key hex are equal, false otherwise.

***

### fromPrivateKey()

> `static` **fromPrivateKey**(`data`): [`KeyPair`](KeyPair.md)

Defined in: [key-pair.ts:112](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L112)

Static method creates a new KeyPair from a PrivateKey object or private key bytes.

#### Parameters

##### data

The private key bytes

`Bytes` | [`PrivateKey`](PrivateKey.md)

#### Returns

[`KeyPair`](KeyPair.md)

A new KeyPair object

***

### fromSecret()

> `static` **fromSecret**(`secret`): [`KeyPair`](KeyPair.md)

Defined in: [key-pair.ts:138](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L138)

Static method creates a new KeyPair (PrivateKey/PublicKey) bigint secret.

#### Parameters

##### secret

`bigint`

The private key secret

#### Returns

[`KeyPair`](KeyPair.md)

A new KeyPair object

***

### generate()

> `static` **generate**(): [`KeyPair`](KeyPair.md)

Defined in: [key-pair.ts:186](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L186)

Static method to generate a new random PrivateKey / PublicKey KeyPair.

#### Returns

[`KeyPair`](KeyPair.md)

A new PrivateKey object.

***

### toHex()

> `static` **toHex**(`keyBytes`): `Hex`

Defined in: [key-pair.ts:150](https://github.com/jintekc/did-btc1-js/blob/aa75bd43ddec8f4aae560eddf93df2b86d590cae/packages/key-pair/src/key-pair.ts#L150)

Converts key bytes to a hex string.

#### Parameters

##### keyBytes

`Bytes`

The key bytes (private or public).

#### Returns

`Hex`

The key bytes as a hex string.
