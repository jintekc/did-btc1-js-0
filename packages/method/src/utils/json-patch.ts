import { Btc1Error, PatchOperation } from '@did-btc1/common';
import { Btc1DidDocument } from './btc1/did-document.js';

/**
 * Implementation of {@link https://datatracker.ietf.org/doc/html/rfc6902 | IETF RFC 6902 JSON Patch}.
 *
 * JavaScript Object Notation (JSON) Patch defines a JSON document structure for expressing a sequence of operations to
 * apply to a JavaScript Object Notation (JSON) document; it is suitable for use with the HTTP PATCH method. The
 * "application/json-patch+json" media type is used to identify such patch documents.
 *
 * @class JsonPatch
 * @type {JsonPatch}
 */
export default class JsonPatch {
  /**
   * Applies a JSON Patch to a source document and returns the patched document.
   * @param {Btc1DidDocument} sourceDocument The source document to patch.
   * @param {PatchOperation[]} operations The JSON Patch operations to apply.
   * @returns {Btc1DidDocument} The patched document.
   * @throws {Error} If an unsupported operation is provided.
   */
  public static apply(sourceDocument: Btc1DidDocument, operations: PatchOperation[]): Btc1DidDocument {
    const patchedDocument = JSON.parse(JSON.stringify(sourceDocument));

    for (const operation of operations) {
      const { op, path, value, from } = operation;

      const segments = path.split('/').slice(1);

      switch (op) {
        case 'add':
          JsonPatch.setValue(patchedDocument, segments, value);
          break;

        case 'remove':
          JsonPatch.removeValue(patchedDocument, segments);
          break;

        case 'replace':
          JsonPatch.setValue(patchedDocument, segments, value);
          break;

        case 'move':{
          if (!from) throw new Error('Missing \'from\' in move operation');
          const fromSegments = from.split('/').slice(1);
          const movedValue = JsonPatch.getValue(patchedDocument, fromSegments);
          JsonPatch.removeValue(patchedDocument, fromSegments);
          JsonPatch.setValue(patchedDocument, segments, movedValue);
          break;
        }
        case 'copy':{
          if (!from) throw new Error('Missing \'from\' in copy operation');
          const copiedValue = JsonPatch.getValue(patchedDocument, from.split('/').slice(1));
          JsonPatch.setValue(patchedDocument, segments, copiedValue);
          break;

        }
        case 'test':{
          const existingValue = JsonPatch.getValue(patchedDocument, segments);
          if (JSON.stringify(existingValue) !== JSON.stringify(value)) {
            throw new Btc1Error(`Test operation failed at path`, 'JSON_PATCH_APPLY_ERROR', { path });
          }
          break;
        }
        default:
          throw new Btc1Error(`Unsupported JSON Patch operation`, 'JSON_PATCH_APPLY_ERROR', { op });
      }
    }

    return patchedDocument;
  }


  /**
   * Gets the value at a given path in an object.
   * @private
   * @param {*} obj The object to get the value from.
   * @param {string[]} path The path to the value.
   * @returns {*} The value at the given path.
   */
  private static getValue(obj: any, path: string[]): any {
    return path.reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
  }


  /**
   * Sets the value at a given path in an object.
   * @private
   * @param {*} obj The object to set the value in.
   * @param {string[]} path The path to the value.
   * @param {*} value The value to set.
   * @returns {*} The object with the value set.
   */
  private static setValue(obj: any, path: string[], value: any): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) current[key] = {};
      current = current[key];
    }
    current[path[path.length - 1]] = value;
  }


  /**
   * Removes the value at a given path in an object.
   * @private
   * @param {*} obj The object to remove the value from.
   * @param {string[]} path The path to the value.
   * @returns {*} The object with the value removed.
   */
  private static removeValue(obj: any, path: string[]): void {
    let current = obj;
    for (let i = 0; i < path.length - 1; i++) {
      const key = path[i];
      if (!(key in current)) return;
      current = current[key];
    }
    delete current[path[path.length - 1]];
  }
}