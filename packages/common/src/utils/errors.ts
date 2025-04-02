/**
 * An enumeration of possible DID error codes.
 */
export enum Btc1ErrorCode {
  /** The DID supplied does not conform to valid syntax. */
  INVALID_DID = 'INVALID_DID',

  /** The supplied method name is not supported by the DID method and/or DID resolver implementation. */
  METHOD_NOT_SUPPORTED = 'METHOD_NOT_SUPPORTED',

  /** An unexpected error occurred during the requested DID operation. */
  INTERNAL_ERROR = 'INTERNAL_ERROR',

  /** The DID document supplied does not conform to valid syntax. */
  INVALID_DID_DOCUMENT = 'INVALID_DID_DOCUMENT',

  /** The byte length of a DID document does not match the expected value. */
  INVALID_DID_DOCUMENT_LENGTH = 'INVALID_DID_DOCUMENT_LENGTH',

  /** The DID URL supplied to the dereferencing function does not conform to valid syntax. */
  INVALID_DID_URL = 'INVALID_DID_URL',

  /** The given proof of a previous DID is invalid */
  INVALID_PREVIOUS_DID_PROOF = 'INVALID_PREVIOUS_DID_PROOF',

  /** An invalid public key is detected during a DID operation. */
  INVALID_PUBLIC_KEY = 'INVALID_PUBLIC_KEY',

  /** An invalid multibase format is detected on the public key during a DID operation. */
  INVALID_PUBLIC_KEY_MULTIBASE = 'INVALID_PUBLIC_KEY_MULTIBASE',

  /** The byte length of a public key does not match the expected value. */
  INVALID_PUBLIC_KEY_LENGTH = 'INVALID_PUBLIC_KEY_LENGTH',

  /** An invalid public key type was detected during a DID operation. */
  INVALID_PUBLIC_KEY_TYPE = 'INVALID_PUBLIC_KEY_TYPE',

  /** Verification of a signature failed during a DID operation. */
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',

  /** The DID resolver was unable to find the DID document resulting from the resolution request. */
  NOT_FOUND = 'NOT_FOUND',

  /**
   * The representation requested via the `accept` input metadata property is not supported by the
   * DID method and/or DID resolver implementation.
   */
  REPRESENTATION_NOT_SUPPORTED = 'REPRESENTATION_NOT_SUPPORTED',

  /** The type of a public key is not supported by the DID method and/or DID resolver implementation. */
  UNSUPPORTED_PUBLIC_KEY_TYPE = 'UNSUPPORTED_PUBLIC_KEY_TYPE',

  /** The proof verification operation failed. */
  PROOF_VERIFICATION_ERROR = 'PROOF_VERIFICATION_ERROR',

  /** The proof generation operation failed. */
  PROOF_GENERATION_ERROR = 'PROOF_GENERATION_ERROR',

  /** The proof serialization operation failed. */
  PROOF_SERIALIZATION_ERROR = 'PROOF_SERIALIZATION_ERROR',

  /** The proof could not be parsed properly. */
  PROOF_PARSING_ERROR = 'PROOF_PARSING_ERROR',
}

export const {
  INVALID_DID,
  METHOD_NOT_SUPPORTED,
  INTERNAL_ERROR,
  INVALID_DID_DOCUMENT,
  INVALID_DID_DOCUMENT_LENGTH,
  INVALID_DID_URL,
  INVALID_PREVIOUS_DID_PROOF,
  INVALID_PUBLIC_KEY,
  INVALID_PUBLIC_KEY_MULTIBASE,
  INVALID_PUBLIC_KEY_LENGTH,
  INVALID_PUBLIC_KEY_TYPE,
  INVALID_SIGNATURE,
  NOT_FOUND,
  REPRESENTATION_NOT_SUPPORTED,
  UNSUPPORTED_PUBLIC_KEY_TYPE,
  PROOF_VERIFICATION_ERROR,
  PROOF_GENERATION_ERROR,
  PROOF_SERIALIZATION_ERROR,
  PROOF_PARSING_ERROR
} = Btc1ErrorCode;

export type ErrorOptions = {
  type?: string;
  name?: string;
  data?: any;
}

export class DidBtc1Error extends Error {
  name: string = 'DidBtc1Error';
  type: string = 'DidBtc1Error';
  data?: Record<string, any>;

  constructor(message: string, options: ErrorOptions = {}) {
    super(message);
    this.type = options.type ?? this.type;
    this.name = options.name ?? this.name;
    this.data = options.data;

    // Ensures that instanceof works properly, the correct prototype chain when using inheritance,
    // and that V8 stack traces (like Chrome, Edge, and Node.js) are more readable and relevant.
    Object.setPrototypeOf(this, new.target.prototype);

    // Captures the stack trace in V8 engines (like Chrome, Edge, and Node.js).
    // In non-V8 environments, the stack trace will still be captured.
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DidBtc1Error);
    }
  }
}

export class Btc1Error extends DidBtc1Error {
  constructor(message: string, type: string, data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class Btc1ReadError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1ReadError', data?: Record<string, any>) {
    super(message, { type, name: 'Btc1ReadError', data });
  }
}

export class Btc1KeyManagerError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1KeyManagerError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class BitcoinRpcError extends DidBtc1Error {
  constructor(message: string, type: string = 'BitcoinRpcError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class DidDocumentError extends DidBtc1Error {
  constructor(message: string, type: string = 'DidDocumentError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CryptosuiteError extends DidBtc1Error {
  constructor(message: string, type: string = 'CryptosuiteError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class KeyPairError extends DidBtc1Error {
  constructor(message: string, type: string = 'KeyPairError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class PrivateKeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'PrivateKeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class PublicKeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'PublicKeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class MultikeyError extends DidBtc1Error {
  constructor(message: string, type: string = 'MultikeyError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class ProofError extends DidBtc1Error {
  constructor(message: string, type: string = 'ProofError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class SingletonBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'SingletonBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CIDAggregateBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'CIDAggregateBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class SMTAggregateBeaconError extends DidBtc1Error {
  constructor(message: string, type: string = 'SMTAggregateBeaconError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CanonicalizationError extends DidBtc1Error {
  constructor(message: string, type: string = 'CanonicalizationError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}