import { createHash } from 'crypto';

/** Size of each SHA-256 hash (in bytes). */
export const hashSize = 32;

/** NodeHash is the 32-byte output of a SHA-256 hash. */
export type NodeHash = Uint8Array;

/**
 * ZeroNodeHash is a 32‑byte array of all zeroes,
 * analogous to Go’s ZeroNodeHash in mssmt.go.
 */
export const ZeroNodeHash: NodeHash = new Uint8Array(hashSize); // all zeroes

/**
 * Helper to produce a fresh 32-byte SHA-256 digest from arbitrary data.
 * Returns a Uint8Array of length 32.
 */
function sha256(...inputs: (Uint8Array | Buffer)[]): Uint8Array {
  const hash = createHash('sha256');
  for (const data of inputs) {
    hash.update(data);
  }
  return new Uint8Array(hash.digest());
}

/**
 * Encode a bigint (64-bit unsigned) into an 8-byte buffer (big-endian).
 * In Go, we used `binary.BigEndian.PutUint64`.
 */
function encodeBigUint64BE(value: bigint): Uint8Array {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64BE(value);
  return buf;
}

/**
 * The Node interface represents a single MS-SMT node (leaf or branch).
 * Each node commits to a 32-byte hash (nodeHash) and a 64-bit sum (nodeSum).
 */
export interface Node {
  /** nodeHash returns the unique 32-byte identifier for a MS-SMT node. */
  nodeHash(): NodeHash;

  /** nodeSum returns the sum commitment of the node (uint64). */
  nodeSum(): bigint;

  /** copy returns a deep copy of the node. */
  copy(): Node;
}

/**
 * isEqualNode replicates IsEqualNode from mssmt.go,
 * checking equality by both hash and sum.
 */
export function isEqualNode(a: Node | null, b: Node | null): boolean {
  if (a === null || b === null) {
    return a === b;
  }
  const sameHash = bufferEq(a.nodeHash(), b.nodeHash());
  const sameSum = a.nodeSum() === b.nodeSum();
  return sameHash && sameSum;
}

/** Simple helper for comparing two Uint8Arrays. */
function bufferEq(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) {
    return false;
  }
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

/**
 * LeafNode represents a leaf node in the MS-SMT.
 * It commits to a `Value` (arbitrary bytes) and a 64-bit `sum`.
 */
export class LeafNode implements Node {
  private nodeHashCache: NodeHash | null = null;

  constructor(
    /** Raw byte value stored in the leaf. */
    public Value: Uint8Array,
    /** Sum associated with this leaf. */
    private sumValue: bigint,
  ) {}

  /**
   * nodeHash returns the SHA-256 hash of (Value || sum).
   * Caches result to avoid recomputing.
   */
  public nodeHash(): NodeHash {
    if (this.nodeHashCache) {
      return this.nodeHashCache;
    }
    const sumBuf = encodeBigUint64BE(this.sumValue);
    const hash = sha256(this.Value, sumBuf);
    this.nodeHashCache = hash;
    return hash;
  }

  /** nodeSum returns the sum of this leaf (the leaf’s own sum). */
  public nodeSum(): bigint {
    return this.sumValue;
  }

  /** isEmpty indicates whether this leaf is “empty” (nil value, sum=0). */
  public isEmpty(): boolean {
    return this.Value.length === 0 && this.sumValue === 0n;
  }

  /** copy returns a deep clone of this leaf node. */
  public copy(): Node {
    const valueCopy = new Uint8Array(this.Value);
    const clone = new LeafNode(valueCopy, this.sumValue);
    // If we’ve computed nodeHashCache, copy it too.
    if (this.nodeHashCache) {
      clone.nodeHashCache = new Uint8Array(this.nodeHashCache);
    }
    return clone;
  }
}

/**
 * EmptyLeafNode mimics `EmptyLeafNode` from Go code:
 * a leaf with no value and a sum of 0.
 */
export const EmptyLeafNode = new LeafNode(new Uint8Array(0), 0n);

/**
 * BranchNode is an internal node that has two children (left/right).
 * Its hash = sha256(leftHash || rightHash || branchSum),
 * where branchSum = leftSum + rightSum.
 */
export class BranchNode implements Node {
  private nodeHashCache: NodeHash | null = null;
  private sumCache: bigint | null = null;

  constructor(
    public Left: Node,
    public Right: Node,
  ) {}

  /** nodeHash returns sha256(leftHash || rightHash || nodeSum). */
  public nodeHash(): NodeHash {
    if (this.nodeHashCache) {
      return this.nodeHashCache;
    }
    const leftH = this.Left.nodeHash();
    const rightH = this.Right.nodeHash();
    const sumBuf = encodeBigUint64BE(this.nodeSum());
    const hash = sha256(leftH, rightH, sumBuf);
    this.nodeHashCache = hash;
    return hash;
  }

  /** nodeSum is leftSum + rightSum, cached to avoid repeated addition. */
  public nodeSum(): bigint {
    if (this.sumCache !== null) {
      return this.sumCache;
    }
    const sumVal = this.Left.nodeSum() + this.Right.nodeSum();
    this.sumCache = sumVal;
    return sumVal;
  }

  /**
   * copy returns a deep copy that replaces the children
   * with “computed nodes” if you want minimal data,
   * or you can copy them fully.
   */
  public copy(): Node {
    // If you want an exact deep copy, just do:
    //    return new BranchNode(this.Left.copy(), this.Right.copy());
    //
    // But mssmt.go’s `Copy()` in BranchNode uses computed sub-nodes
    // to avoid storing full subtrees. We’ll mirror that:
    const newNode = new BranchNode(
      new ComputedNode(this.Left.nodeHash(), this.Left.nodeSum()),
      new ComputedNode(this.Right.nodeHash(), this.Right.nodeSum()),
    );

    // Copy caches if available.
    if (this.nodeHashCache) {
      newNode.nodeHashCache = new Uint8Array(this.nodeHashCache);
    }
    if (this.sumCache !== null) {
      newNode.sumCache = this.sumCache;
    }

    return newNode;
  }
}

/**
 * ComputedNode is like `ComputedNode` in mssmt.go:
 * We only store (hash, sum) for a node, no direct sub-node references.
 */
export class ComputedNode implements Node {
  constructor(
    private hashVal: NodeHash,
    private sumVal: bigint
  ) {}

  public nodeHash(): NodeHash {
    return this.hashVal;
  }

  public nodeSum(): bigint {
    return this.sumVal;
  }

  public copy(): Node {
    return new ComputedNode(
      new Uint8Array(this.hashVal),
      this.sumVal
    );
  }
}

/**
 * newBranch is a convenience function akin to NewBranch in Go.
 */
export function newBranch(left: Node, right: Node): BranchNode {
  return new BranchNode(left, right);
}

export const MaxTreeLevels = 256;
const lastBitIndex = MaxTreeLevels - 1;

/**
 * Example placeholders: the real code in Taproot Assets has a global
 * array `EmptyTree[i]` for each possible subtree height, each entry
 * is a default node. Here we just store all of them as empty leaves.
 */
export const EmptyTree: Node[] = new Array(MaxTreeLevels + 1)
  .fill(EmptyLeafNode);

/** bitIndex is a helper to retrieve the i-th bit (0 or 1) from key. */
export function bitIndex(i: number, key: Uint8Array): number {
  const bytePos = i >>> 3;         // i / 8
  const bitPos = 7 - (i & 0x07);   // invert to read from left to right
  return (key[bytePos] >> bitPos) & 0x01;
}

/**
 * CompactedLeafNode includes a leaf plus enough info to reconstruct
 * the omitted internal path above it.
 */
export class CompactedLeafNode extends LeafNode {
  private key: Uint8Array;
  private compactedNodeHash: NodeHash;

  constructor(
    height: number,
    key: Uint8Array,
    leaf: LeafNode
  ) {
    // Start with the LeafNode portion:
    super(leaf.Value, leaf.nodeSum());
    this.key = key;

    // “Compacting” means building branches above the leaf up to the given height:
    let current: Node = leaf;
    for (let i = lastBitIndex; i >= height; i--) {
      if (bitIndex(i, key) === 0) {
        current = newBranch(current, EmptyTree[i + 1]);
      } else {
        current = newBranch(EmptyTree[i + 1], current);
      }
    }
    this.compactedNodeHash = current.nodeHash();
  }

  /** NodeHash returns the hash for the entire “compacted” path. */
  public nodeHash(): NodeHash {
    return this.compactedNodeHash;
  }

  /** Key returns the 32-byte key associated with this leaf. */
  public Key(): Uint8Array {
    return this.key;
  }

  /**
   * extract reconstructs the missing branches up to `height` in the tree.
   * Returns the topmost node in that extracted subtree.
   */
  public extract(height: number): Node {
    let current: Node = new LeafNode(this.Value, this.nodeSum());
    for (let j = MaxTreeLevels; j > height + 1; j--) {
      let left: Node;
      let right: Node;
      if (bitIndex(j - 1, this.key) === 0) {
        left = current;
        right = EmptyTree[j];
      } else {
        left = EmptyTree[j];
        right = current;
      }
      current = newBranch(left, right);
    }
    return current;
  }

  /** copy returns a deep copy, including the parent's data. */
  public copy(): Node {
    const baseCopy = super.copy() as LeafNode;
    const c = new CompactedLeafNode(
      0, // We'll rebuild internal path if needed
      new Uint8Array(this.key),
      baseCopy
    );
    c.compactedNodeHash = new Uint8Array(this.compactedNodeHash);
    return c;
  }
}