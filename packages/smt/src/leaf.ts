// LeafNode in the MS-SMT: commits to a byte array + 64-bit sum.

import { Node, NodeHash } from './node.js';
import { encodeBigUint64BE, sha256 } from './utils.js';

/** LeafNode represents a leaf node with a `Value` and a 64-bit sum. */
export class LeafNode implements Node {
  private nodeHashCache: NodeHash | null = null;

  constructor(
    public Value: Uint8Array,
    private sumValue: bigint
  ) {}

  nodeHash(): NodeHash {
    if (this.nodeHashCache) {
      return this.nodeHashCache;
    }
    const sumBuf = encodeBigUint64BE(this.sumValue);
    const hash = sha256(this.Value, sumBuf);
    this.nodeHashCache = hash;
    return hash;
  }

  nodeSum(): bigint {
    return this.sumValue;
  }

  /** isEmpty indicates whether this leaf is “empty” (nil value, sum=0). */
  public isEmpty(): boolean {
    return (this.Value.length === 0) && (this.sumValue === 0n);
  }

  copy(): Node {
    // Deep copy the value and preserve sum
    const valueCopy = new Uint8Array(this.Value);
    const clone = new LeafNode(valueCopy, this.sumValue);

    // If we’ve cached the hash, copy that too
    if (this.nodeHashCache) {
      const cacheCopy = new Uint8Array(this.nodeHashCache);
      clone.nodeHashCache = cacheCopy;
    }
    return clone;
  }
}

/**
 * EmptyLeafNode replicates the “EmptyLeafNode” from mssmt.go:
 * a leaf with no value and 0 sum.
 */
export const EmptyLeafNode = new LeafNode(new Uint8Array(0), 0n);
