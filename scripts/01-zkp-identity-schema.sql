-- ZKP Identity Verification Schema

-- Users table for identity records
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Identity Documents (images and JSON)
CREATE TABLE IF NOT EXISTS identity_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'passport', 'id_card', 'driver_license', 'json_data'
  content_type TEXT NOT NULL, -- 'image/jpeg', 'image/png', 'application/json'
  document_url TEXT, -- URL to stored document
  document_hash TEXT NOT NULL, -- SHA-256 hash of document
  date_of_birth TEXT, -- For JSON: extracted DOB, for images: OCR'd or manually entered
  document_number TEXT,
  expiry_date TEXT,
  raw_data JSONB, -- Store JSON data as-is
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ZK Proofs generated
CREATE TABLE IF NOT EXISTS zk_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES identity_documents(id) ON DELETE CASCADE,
  proof_type TEXT NOT NULL, -- 'age_verification', 'document_possession'
  proof_data JSONB NOT NULL, -- Contains commitment, salt, proof hash
  verified_at TIMESTAMP WITH TIME ZONE,
  is_verified BOOLEAN DEFAULT FALSE,
  verification_details JSONB, -- Stores verification results
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- On-Chain Proof Records
CREATE TABLE IF NOT EXISTS on_chain_proofs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  zk_proof_id UUID NOT NULL REFERENCES zk_proofs(id) ON DELETE CASCADE,
  transaction_hash TEXT UNIQUE,
  block_number BIGINT,
  contract_address TEXT NOT NULL,
  proof_commitment TEXT NOT NULL,
  is_valid BOOLEAN DEFAULT FALSE,
  verification_timestamp BIGINT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_wallet ON users(wallet_address);
CREATE INDEX IF NOT EXISTS idx_documents_user ON identity_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_user ON zk_proofs(user_id);
CREATE INDEX IF NOT EXISTS idx_proofs_document ON zk_proofs(document_id);
CREATE INDEX IF NOT EXISTS idx_on_chain_proofs_tx ON on_chain_proofs(transaction_hash);
CREATE INDEX IF NOT EXISTS idx_on_chain_proofs_user ON on_chain_proofs(user_id);
