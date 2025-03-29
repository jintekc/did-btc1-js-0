[**@did-btc1/key-pair v0.4.3**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PrivateKeyUtils

# Class: PrivateKeyUtils

Defined in: [private-key.ts:186](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L186)

Utility class for creating and working with PrivateKey objects.
 PrivateKeyUtils

## Constructors

### Constructor

> **new PrivateKeyUtils**(): `PrivateKeyUtils`

#### Returns

`PrivateKeyUtils`

## Methods

### computePublicKey()

> `static` **computePublicKey**(`privateKeyBytes`): `Bytes`

Defined in: [private-key.ts:254](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L254)

Computes the public key bytes from a private key bytes.

#### Parameters

##### privateKeyBytes

`Bytes`

The private key bytes

#### Returns

`Bytes`

The public key bytes

#### Throws

If the public key is not compressed or not derived

***

### fromSecret()

> `static` **fromSecret**(`secret`): [`PrivateKey`](PrivateKey.md)

Defined in: [private-key.ts:238](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L238)

Create a new PrivateKey object from a bigint secret.

#### Parameters

##### secret

`bigint`

The secret bigint

#### Returns

[`PrivateKey`](PrivateKey.md)

A new PrivateKey object

***

### isValid()

> `static` **isValid**(`bytes`): `boolean`

Defined in: [private-key.ts:228](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L228)

Checks if the private key is valid.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`boolean`

True if the private key is valid, false otherwise

***

### randomBytes()

> `static` **randomBytes**(): `Bytes`

Defined in: [private-key.ts:282](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L282)

Static method to generate random private key bytes.

#### Returns

`Bytes`

Uint8Array of 32 random bytes.

***

### toBytes()

> `static` **toBytes**(`secret`): `Bytes`

Defined in: [private-key.ts:205](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L205)

Convert a private key bytes to a bigint secret.

#### Parameters

##### secret

`bigint`

The private key secret.

#### Returns

`Bytes`

The private key secret as private key bytes.

***

### toSecret()

> `static` **toSecret**(`bytes`): `bigint`

Defined in: [private-key.ts:195](https://github.com/jintekc/did-btc1-js/blob/39e4a4200a4ca873ea5b9fda29e99ad64678b8c2/packages/key-pair/src/private-key.ts#L195)

Convert a bigint secret to private key bytes.

#### Parameters

##### bytes

`Bytes`

The private key bytes

#### Returns

`bigint`

The private key bytes as a bigint secret
