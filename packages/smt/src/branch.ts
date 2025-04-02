// BranchNode in the MS-SMT: an internal node referencing two children.

import { ComputedNode } from './computed.js';
import { Node, NodeHash } from './node.js';
import { encodeBigUint64BE, sha256 } from './utils.js';

export class BranchNode implements Node {
  private nodeHashCache: NodeHash | null = null;
  private sumCache: bigint | null = null;

  constructor(
    public Left: Node,
    public Right: Node
  ) {}

  nodeHash(): NodeHash {
    if (this.nodeHashCache) {
      return this.nodeHashCache;
    }
    const leftHash = this.Left.nodeHash();
    const rightHash = this.Right.nodeHash();
    const sumBuf = encodeBigUint64BE(this.nodeSum());

    const hash = sha256(leftHash, rightHash, sumBuf);
    this.nodeHashCache = hash;
    return hash;
  }

  nodeSum(): bigint {
    if (this.sumCache !== null) {
      return this.sumCache;
    }
    const sumVal = this.Left.nodeSum() + this.Right.nodeSum();
    this.sumCache = sumVal;
    return sumVal;
  }

  /**
   * copy returns a deep copy. In the Go code, the BranchNode’s Copy
   * returns a branch whose children are “ComputedNode”. You can adapt
   * to your needs, e.g. full deep copy or minimal references.
   */
  copy(): Node {
    // “Computed node” style: only store hash+sum of the children.
    const leftComp = new ComputedNode(this.Left.nodeHash(), this.Left.nodeSum());
    const rightComp = new ComputedNode(this.Right.nodeHash(), this.Right.nodeSum());

    const newBranch = new BranchNode(leftComp, rightComp);

    // Copy caches if set
    if (this.nodeHashCache) {
      newBranch.nodeHashCache = new Uint8Array(this.nodeHashCache);
    }
    if (this.sumCache !== null) {
      newBranch.sumCache = this.sumCache;
    }

    return newBranch;
  }
}

/**
 * newBranch replicates the “NewBranch” function from Go,
 * constructing a BranchNode from left+right children.
 */
export function newBranch(left: Node, right: Node): BranchNode {
  return new BranchNode(left, right);
}
