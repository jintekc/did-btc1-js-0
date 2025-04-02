// ComputedNode stores only a hash+sum, i.e. no sub-node references.

import { Node, NodeHash } from './node.js';

export class ComputedNode implements Node {
  constructor(
    private hashVal: NodeHash,
    private sumVal: bigint
  ) {}

  nodeHash(): NodeHash {
    return this.hashVal;
  }

  nodeSum(): bigint {
    return this.sumVal;
  }

  copy(): Node {
    // Return a new ComputedNode with a copy of the hash
    const hashCopy = new Uint8Array(this.hashVal);
    return new ComputedNode(hashCopy, this.sumVal);
  }
}
