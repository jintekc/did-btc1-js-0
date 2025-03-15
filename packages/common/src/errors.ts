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
      Error.captureStackTrace(this, BitcoinRpcError);
    }
  }
}

export class BitcoinRpcError extends DidBtc1Error {
  constructor(message: string, type: string = 'BitcoinRpcError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class Btc1DidDocumentError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1DidDocumentError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class Btc1KeyManagerError extends DidBtc1Error {
  constructor(message: string, type: string = 'Btc1KeyManagerError', data?: Record<string, any>) {
    super(message, { type, name: type, data });
  }
}

export class CryptosuiteError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'CryptosuiteError', 'CryptosuiteError');
  }
}

export class KeyPairError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'KeyPairError', 'KeyPairError');
  }
}

export class PrivateKeyError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'PrivateKeyError', 'PrivateKeyError');
  }
}

export class PublicKeyError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'PublicKeyError', 'PublicKeyError');
  }
}

export class MultikeyError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'MultikeyError', 'MultikeyError');
  }
}

export class ProofError extends DidBtc1Error {
  constructor(message: string, type?: string) {
    super(message, type ?? 'ProofError', 'ProofError');
  }
}