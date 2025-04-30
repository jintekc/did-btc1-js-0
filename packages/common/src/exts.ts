import { Canonicalization } from './canonicalization.js';
import { Patch } from './patch.js';
import { JSONObject, Maybe, Prototyped, Unprototyped } from './types/general.js';

/** Extend the global namespace */
declare global {
    /** Extend the Array Object class interface */
    interface Array<T> {
        /** Get the last element of the array */
        last(): T | undefined;
        /** Get the last element of the array */
        [-1](): T | undefined;
    }

    /** Extend the Set class interface */
    interface Set<T> {
      /** Get the difference between two sets */
      difference(other: Set<T>): Set<T>;
    }

    /** Extend the JSON class interface */
    interface JSON {
        /** Check if an object is a JSON object */
        is(unknown: Maybe<JSONObject>): boolean;
        /** Check if JSON string can be parsed to JSON object */
        parsable(unknown: Maybe<string>): boolean;
        /** Check if JSON object can be converted to JSON string */
        stringifiable(unknown: Maybe<JSONObject>): boolean;
        /** Check if JSON object is unprototyped [Object: null prototype] {} */
        unprototyped(unknown: Maybe<Prototyped>): boolean;
        /** Normalize unprototyped JSON object to prototyped JSON object */
        normalize(unknown: Maybe<Unprototyped>): Prototyped;
        /** Shallow copy of JSON object */
        copy(o: JSONObject): JSONObject;
        /** Deep copy of JSON object */
        deepCopy(o: JSONObject): JSONObject;
        /** Check if two objects are strictly equal */
        equal(a: any, b: any): boolean;
        /** Check if two objects are deeply equal */
        deepEqual(a: any, b: any): boolean;
        /** Delete key/value pair(s) from a JSON object */
        delete(o: JSONObject, keys: Array<string | number | symbol>): JSONObject;
        /** Sanitize a JSON object by removing any keys whose value is undefined */
        sanitize(o: JSONObject): JSONObject;
        /** Canonicalization object */
        canonicalization: Canonicalization;
        /** JSON Patch (IETF RFC 6902) */
        patch: Patch;
    }

    interface Date {
      /** Get the UTC date and time in ISO 8601 format */
      getUTCDateTime(): string;
      /** Convert date to Unix timestamp */
      toUnix(): number;
    }

    interface String {
      /** Convert to SCREAMING_SNAKE_CASE */
      toSnakeScream(): string;
      /** Convert to snake_case */
      toSnake(): string;
      /** Remove the last character from a string */
      chop(): string;
      /** Replace the end of a string */
      replaceEnd(e: string | RegExp, r?: string): string;
    }
}

/** Array Interface Extensions */
Array.prototype.last = function <T>(): T | undefined {
  return this[this.length - 1] ?? undefined;
};

Array.prototype[-1] = function <T>(): T | undefined {
  return this.last();
};

/** Set Interface Extensions */
Set.prototype.difference = function <T>(other: Set<T>): Set<T> {
  const result = new Set<T>(this);
  for (const item of other) {
    if (result.has(item)) {
      result.delete(item);
    }
  }
  return result;
};

/** JSON Interface Extensions */
JSON.is = function (unknown: Maybe<JSONObject>): boolean {
  if (unknown === null || typeof unknown !== 'object') return false;
  if (Array.isArray(unknown))
    return unknown.every(item => Object.getPrototypeOf(item) !== null);
  else
    return Object.getPrototypeOf(unknown) === null;
};

JSON.parsable = function (unknown: Maybe<string>): boolean {
  try {
    JSON.parse(unknown);
    return true;
  } catch {
    return false;
  }
};

JSON.stringifiable = function (unknown: Maybe<JSONObject>): boolean {
  try {
    JSON.stringify(unknown);
    return true;
  } catch {
    return false;
  }
};

JSON.unprototyped = function (unknown: Maybe<Unprototyped>): boolean {
  if (Array.isArray(unknown)) {
    return unknown.every(item => Object.getPrototypeOf(item) === null);
  }
  return Object.getPrototypeOf(unknown) === null;
};

JSON.normalize = function (unknown: Maybe<Unprototyped>): Prototyped {
  try {
    return JSON.parse(JSON.stringify(unknown));
  } catch {
    throw new Error('The object is not unprotocyped');
  }
};

JSON.copy = function (o: JSONObject): JSONObject {
  return Object.assign({}, o);
};

JSON.deepCopy = function (o: Maybe<JSONObject>): JSONObject {
  return JSON.parse(JSON.stringify(o));
};

JSON.equal = function (a: any, b: any): boolean {
  return a === b;
};

JSON.deepEqual = function (a: any, b: any): boolean {
  if(JSON.equal(a, b)) return true;

  if (a === null || b === null || typeof a !== typeof b) return false;

  if (typeof a === 'object') {
    const isArrayA = Array.isArray(a);
    const isArrayB = Array.isArray(b);
    if (isArrayA !== isArrayB) return false;

    if (isArrayA && isArrayB) {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i++) {
        if (!this.deepEqual(a[i], b[i])) return false;
      }
      return true;
    } else {
      const keysA = Object.keys(a);
      const keysB = Object.keys(b);
      if (keysA.length !== keysB.length) return false;

      for (const key of keysA) {
        if (!Object.prototype.hasOwnProperty.call(b, key)) {
          return false;
        }
        if (!this.deepEqual(a[key], b[key])) {
          return false;
        }
      }
      return true;
    }
  }

  return false;
};

JSON.delete = function(o: JSONObject, keys: Array<string | number | symbol>): JSONObject {
  if (!JSON.is(o)) return o;

  for(const key of keys) {
    if (Object.prototype.hasOwnProperty.call(o, key)) {
      delete o[key];
    }

    for (const key in o) {
      if (typeof o[key] === 'object') {
        o[key] = this.delete(o[key], [key]);
      }
    }
  }

  return o;
};

JSON.sanitize = function (o: JSONObject): JSONObject {
  for (const key of Object.keys(o)) {
    if (o[key] === undefined) {
      delete o[key];
    }
  }
  return o;
};

JSON.canonicalization = new Canonicalization();
JSON.patch = new Patch();

/** Date Interface Extensions */
Date.prototype.getUTCDateTime = function (): string {
  return `${this.toISOString().slice(0, -5)}Z`;
};

Date.prototype.toUnix = function (): number {
  const time = this.getTime();
  if (isNaN(time)) {
    throw new Error(`Invalid date string: "${this}"`);
  }
  return time;
};

/** String Interface Extensions */
String.prototype.toSnake = function (): string {
  return this
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .toLowerCase();
};

String.prototype.toSnakeScream = function (): string {
  return this.toSnake().toUpperCase();
};

String.prototype.chop = function (): string {
  return this.length > 0 ? this.slice(0, -1) : '';
};

String.prototype.replaceEnd = function (e: string | RegExp, r?: string): string {
  const pattern = e instanceof RegExp
    ? new RegExp(e.source.endsWith('$') ? e.source : `${e.source}$`, e.flags.replace('g', ''))
    : new RegExp(`${e.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')}$`);

  return this.replace(pattern, r ?? '');
};

export default global;