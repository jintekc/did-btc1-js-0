[**@did-btc1/key-pair v0.4.6**](../README.md)

***

[@did-btc1/key-pair](../globals.md) / PublicKeyUtils

# Class: PublicKeyUtils

Defined in: [public-key.ts:215](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L215)

Utility class for Multikey operations/
 PublicKeyUtils

## Constructors

### Constructor

> **new PublicKeyUtils**(): `PublicKeyUtils`

#### Returns

`PublicKeyUtils`

## Methods

### fromPrivateKey()

> `static` **fromPrivateKey**(`pk`): [`PublicKey`](PublicKey.md)

Defined in: [public-key.ts:222](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L222)

Computes the deterministic public key for a given private key.

#### Parameters

##### pk

The PrivateKey object or the private key bytes

`Bytes` | [`PrivateKey`](PrivateKey.md)

#### Returns

[`PublicKey`](PublicKey.md)

A new PublicKey object

***

### liftX()

> `static` **liftX**(`xBytes`): `Uint8Array`

Defined in: [public-key.ts:274](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L274)

Lifts a 32-byte x-only coordinate into a full secp256k1 point (x, y).

#### Parameters

##### xBytes

`Uint8Array`

32-byte x-coordinate

#### Returns

`Uint8Array`

65-byte uncompressed public key (starts with `0x04`)

***

### modPow()

> `static` **modPow**(`base`, `exp`, `mod`): `bigint`

Defined in: [public-key.ts:247](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L247)

Computes modular exponentiation: (base^exp) % mod.
Used for computing modular square roots.

#### Parameters

##### base

`bigint`

The base value

##### exp

`bigint`

The exponent value

##### mod

`bigint`

The modulus value

#### Returns

`bigint`

The result of the modular exponentiation

***

### sqrtMod()

> `static` **sqrtMod**(`a`, `p`): `bigint`

Defined in: [public-key.ts:265](https://github.com/jintekc/did-btc1-js/blob/dd20f4b9bd459a4d73fe7313221c1571bed9c4b1/packages/key-pair/src/public-key.ts#L265)

Computes `sqrt(a) mod p` using Tonelli-Shanks algorithm.
This finds `y` such that `y^2 ≡ a mod p`.

#### Parameters

##### a

`bigint`

The value to find the square root of

##### p

`bigint`

The prime modulus

#### Returns

`bigint`

The square root of `a` mod `p`
