// Core Node interface shared by leaf/branch/computed nodes.

import { bufferEq } from './utils.js';

/** NodeHash is a 32-byte hash in TypeScript as a Uint8Array. */
export type NodeHash = Uint8Array;

/**
 * Node represents a single MS-SMT node (leaf or branch),
 * each with a nodeHash and a 64-bit nodeSum.
 */
export interface Node {
  nodeHash(): NodeHash;
  nodeSum(): bigint;
  copy(): Node;
}

/**
 * isEqualNode checks equality by nodeHash + nodeSum. It replicates
 * IsEqualNode from mssmt.go.
 */
export function isEqualNode(a: Node | null, b: Node | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  const sameHash = bufferEq(a.nodeHash(), b.nodeHash());
  const sameSum = (a.nodeSum() === b.nodeSum());
  return sameHash && sameSum;
}
