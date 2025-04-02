// CompactedLeafNode is an optional extension from mssmt.go that
// represents a “compacted” subtree above a single leaf.
// If you don’t need compacted subtrees, this file is optional.

import { LeafNode } from './leaf.js';
import { Node, NodeHash } from './node.js';
import { bitIndex } from './utils.js';
import { MAX_TREE_LEVELS } from './constants.js';
import { newBranch } from './branch.js';
import { EmptyLeafNode } from './leaf.js';

/**
 * If you truly want to mimic the code from mssmt.go, you might have
 * an array of “EmptyTree[i]” for each possible subtree height i,
 * where each entry is a default node (e.g. empty branches).
 * For demonstration, we store them all as empty leaves or
 * similar stubs. You can refine this if needed.
 */
export const EmptyTree: Node[] = new Array(MAX_TREE_LEVELS + 1)
  .fill(EmptyLeafNode);

const lastBitIndex = MAX_TREE_LEVELS - 1;

/**
 * CompactedLeafNode holds the leaf plus enough info to reconstruct
 * the omitted internal path above it.
 */
export class CompactedLeafNode extends LeafNode {
  private key: Uint8Array;
  private compactedNodeHash: NodeHash;

  constructor(height: number, key: Uint8Array, leaf: LeafNode) {
    // Initialize the LeafNode portion
    super(leaf.Value, leaf.nodeSum());
    this.key = key;

    // Build up the “compacted” path from the leaf up to `height`
    let current: Node = leaf;
    for (let i = lastBitIndex; i >= height; i--) {
      const bit = bitIndex(i, key);
      if (bit === 0) {
        current = newBranch(current, EmptyTree[i + 1]);
      } else {
        current = newBranch(EmptyTree[i + 1], current);
      }
    }
    this.compactedNodeHash = current.nodeHash();
  }

  /** nodeHash returns the hash of the entire “compacted” subtree. */
  public nodeHash(): NodeHash {
    return this.compactedNodeHash;
  }

  /** Key returns the 32-byte key associated with this leaf. */
  public Key(): Uint8Array {
    return this.key;
  }

  /**
   * extract reconstructs the missing branches from this leaf
   * up to a certain tree height. Returns the topmost node.
   */
  public extract(height: number): Node {
    let current: Node = new LeafNode(this.Value, this.nodeSum());

    for (let j = MAX_TREE_LEVELS; j > height + 1; j--) {
      const bit = bitIndex(j - 1, this.key);
      if (bit === 0) {
        current = newBranch(current, EmptyTree[j]);
      } else {
        current = newBranch(EmptyTree[j], current);
      }
    }
    return current;
  }

  public copy(): Node {
    // Superclass copy for the leaf portion
    const baseCopy = super.copy() as LeafNode;

    // We'll recreate the path above if needed,
    // but we also need to keep the original `key` and `compactedNodeHash`.
    const keyCopy = new Uint8Array(this.key);
    const c = new CompactedLeafNode(0, keyCopy, baseCopy);
    // Overwrite the nodeHash with our “compacted” hash
    c.compactedNodeHash = new Uint8Array(this.compactedNodeHash);
    return c;
  }
}
