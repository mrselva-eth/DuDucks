// Placeholder types file for re-exports
// These types are defined in app/page.tsx but exported here for convenience

export interface ProofData {
  proofId: string;
  proof: {
    a: string[];
    b: string[][];
    c: string[];
  };
}

export interface OnChainProofData {
  onChainProofId: string;
  proofData: any;
}
