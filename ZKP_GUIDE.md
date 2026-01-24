# Zero-Knowledge Proof (ZKP) Age Verification System

## Overview

This application demonstrates a complete zero-knowledge proof system for age verification with on-chain submission. Users can upload identity documents, generate cryptographic proofs of age without revealing their identity, verify those proofs, and submit them to a smart contract on Ethereum Sepolia testnet.

## Architecture

### 1. **Database Schema** (`scripts/01-zkp-identity-schema.sql`)
- **users**: Stores user profiles
- **identity_documents**: Stores document metadata and hashes
- **zk_proofs**: Stores generated ZK proofs with proof data and status
- **on_chain_proofs**: Tracks on-chain submissions and transaction hashes

### 2. **Cryptographic Core** (`lib/zkp-utils.ts`)

The ZKP implementation uses SHA-256 hashing for commitments and proofs:

#### Key Functions:
- `generateCommitment()`: Creates a commitment hash from identity data + salt
- `generateAgeVerificationProof()`: Generates age proof without revealing actual age
- `verifyAgeProof()`: Server-side proof verification
- `hashDocument()`: SHA-256 hash of document content
- `createOnChainProofData()`: Prepares proof for blockchain submission

#### Proof Structure:
```typescript
{
  commitment: string,           // Hash of identity data
  ageVerification: {
    proof: string,             // Cryptographic proof
    minAge: number,            // Minimum age proven (e.g., 18+)
    timestamp: number          // Proof creation time
  },
  documentHash: string,         // Hash of document
  publicInputs: {
    commitment: string,
    hashedAge: string,         // Hash of age data (privacy layer)
    timestamp: number
  }
}
```

### 3. **API Routes**

#### POST `/api/zkp/generate-proof`
- Accepts identity data and document
- Generates ZK proof
- Stores proof in database
- Returns: `proofId`, `proof`, `publicInputs`

#### POST `/api/zkp/verify-proof`
- Verifies a stored proof
- Re-hashes identity data against proof commitment
- Returns: verification status and proof details

#### POST `/api/zkp/submit-onchain`
- Prepares proof for blockchain submission
- Creates on-chain record in database
- Returns: `onChainProofId`, `proofData` ready for transaction

### 4. **Smart Contract** (`contracts/AgeVerificationZKP.sol`)

Deployed on Ethereum Sepolia, the contract:
- **submitProof()**: Stores proof commitments and age hashes on-chain
- **verifyProof()**: Authorized verifiers validate proofs without accessing identity
- **isUserVerified()**: Check if user has valid, non-expired proof
- **isUserVerifiedForAge()**: Verify user meets specific age requirement

#### Key Features:
- Commitment-based verification (no raw identity data on-chain)
- Expiration time for proofs (1 year default, configurable)
- Role-based access (owner, verifiers)
- Event emissions for proof submissions and verifications

### 5. **Frontend Components**

#### DocumentUpload (`components/zkp/document-upload.tsx`)
- Form for personal information (name, DOB, document ID, country)
- File upload with preview (PNG, JPG, PDF)
- Client-side validation
- Privacy notice about data handling

#### ProofDisplay (`components/zkp/proof-display.tsx`)
- Shows generated proof with formatted hashes
- Explains how ZKP works
- Provides verify and on-chain submission buttons
- Copy-to-clipboard functionality for proof data

#### OnChainSubmission (`components/zkp/onchain-submission.tsx`)
- Wallet connection flow
- Transaction details display
- Links to Sepolia Etherscan
- Verification process explanation

#### Main Page (`app/page.tsx`)
- Multi-step progress interface
- Orchestrates the entire flow
- Handles errors and loading states
- Shows information cards

## How It Works: The Flow

### Step 1: Upload Document
```
User provides:
- Full name
- Date of birth
- Document ID (passport number, etc.)
- Document image or PDF
```

### Step 2: Generate ZK Proof
```
Server:
1. Generates random salt
2. Creates commitment: SHA256(identity_data + salt)
3. Verifies age >= minAge
4. Generates age proof: SHA256(age + minAge + commitment + timestamp)
5. Creates hashedAge: SHA256(minAge + timestamp)
6. Stores proof in database
7. Returns commitment and hashedAge (not actual age)
```

### Step 3: Verify Proof
```
Server verification:
1. Fetches stored proof
2. Re-computes commitment with provided identity data + stored salt
3. Verifies commitment matches
4. Re-computes age proof and verifies it matches
5. Marks proof as "verified"
```

### Step 4: On-Chain Submission
```
Client:
1. Connects Web3 wallet (MetaMask, etc.)
2. Submits proof data to smart contract
3. Smart contract stores:
   - User address
   - Commitment (proves identity without revealing it)
   - Hashedage (proves age requirement met without exact age)
   - Timestamp
   - Proof signature
4. User receives transaction hash
5. Proof is now permanently on-chain
```

### Step 5: Verification
```
Other parties:
1. Check if user has valid proof on-chain
2. Verify proof hasn't expired
3. Know user is 18+ without accessing their identity
4. Can use this for age-gated services
```

## Privacy Guarantees

1. **No Identity Exposure**: Only cryptographic commitments on-chain
2. **No Age Exposure**: Only proof that minimum age is met
3. **Document Privacy**: Only document hash stored, not actual document
4. **Non-Linkability**: Same user can generate different proofs
5. **Verification Without Revelation**: Third parties verify without data access

## Technical Details

### Hashing Algorithm
- **SHA-256** for all commitments and proofs
- 256-bit output (64 hex characters)

### Proof Validation
```typescript
// Commitment validation
expected_commitment = SHA256(identity_data + salt)
actual_commitment ?= expected_commitment ✓

// Age proof validation
expected_age_proof = SHA256(age + minAge + commitment + timestamp)
actual_age_proof ?= expected_age_proof ✓

// Age requirement met
actual_age >= minAge ✓
```

### Proof Expiration
- Default: 365 days
- Configurable by contract owner
- Prevents indefinite proof validity

## Deployment

### Prerequisites
- Node.js 18+
- Supabase project
- Ethereum wallet for deployment

### Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Setup
```bash
# Execute migration
npm run db:migrate
# or paste scripts/01-zkp-identity-schema.sql in Supabase SQL editor
```

### Smart Contract Deployment
```bash
# Using Hardhat
npx hardhat run scripts/deploy.js --network sepolia

# Or using Foundry
forge deploy AgeVerificationZKP --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY
```

### Frontend Deployment
```bash
# Deploy to Vercel
vercel deploy
```

## Testing Flow

1. **Generate Proof**
   - Name: John Doe
   - DOB: 2000-01-01 (24 years old, qualifies for 18+)
   - Document ID: DEMO123
   - Country: US
   - Upload a test image

2. **Verify Proof**
   - System verifies commitment matches
   - Checks age requirement met
   - Marks as verified

3. **Submit On-Chain**
   - Connect Sepolia wallet
   - Submit proof to contract
   - Get transaction hash
   - Check Etherscan

4. **Query Contract**
   ```solidity
   // Check if user verified
   bool isVerified = contract.isUserVerifiedForAge(userAddress, 18);
   ```

## Security Considerations

### Current Implementation
- Simplified ZKP using SHA-256 hashing
- Suitable for demonstration purposes
- Works for basic age verification

### Production Recommendations
1. **Use Zero-Knowledge Circuit Libraries**
   - circom: Circuit creation
   - snarkjs: Proof generation
   - zk-SNARKs: Non-interactive proofs

2. **Enhanced Proof System**
   - Range proofs for age verification
   - Merkle trees for multi-attribute verification
   - Nullifiers for proof linkability prevention

3. **Smart Contract Auditing**
   - Professional security audit
   - Formal verification
   - Bug bounty program

4. **Server Security**
   - HTTPS only
   - Rate limiting
   - Input validation
   - Secure salt storage

5. **User Privacy**
   - Client-side encryption
   - Tor/VPN support
   - Minimize server logging
   - GDPR compliance

## API Examples

### Generate Proof
```bash
curl -X POST http://localhost:3000/api/zkp/generate-proof \
  -H "Content-Type: application/json" \
  -d '{
    "identityData": {
      "name": "John Doe",
      "dateOfBirth": "2000-01-01",
      "documentId": "DEMO123",
      "issuingCountry": "US"
    },
    "minAge": 18,
    "userId": "user123",
    "documentBuffer": "base64_encoded_image"
  }'
```

### Verify Proof
```bash
curl -X POST http://localhost:3000/api/zkp/verify-proof \
  -H "Content-Type: application/json" \
  -d '{
    "proofId": "proof_id_from_generate",
    "identityData": {
      "name": "John Doe",
      "dateOfBirth": "2000-01-01",
      "documentId": "DEMO123",
      "issuingCountry": "US"
    }
  }'
```

### Submit On-Chain
```bash
curl -X POST http://localhost:3000/api/zkp/submit-onchain \
  -H "Content-Type: application/json" \
  -d '{
    "proofId": "proof_id_from_generate",
    "userAddress": "0x..."
  }'
```

## Database Queries

### Get User Proofs
```sql
SELECT * FROM zk_proofs WHERE user_id = 'user123';
```

### Check Verified Proofs
```sql
SELECT * FROM zk_proofs 
WHERE status = 'verified' 
AND created_at > NOW() - INTERVAL '1 year';
```

### Track On-Chain Submissions
```sql
SELECT * FROM on_chain_proofs 
WHERE user_address = '0x...' 
ORDER BY created_at DESC;
```

## Next Steps

1. **Deploy Smart Contract** to Sepolia testnet
2. **Integrate Advanced ZKP** with circom/snarkjs
3. **Add Multi-Attribute Proofs** (country, document type, etc.)
4. **Implement Proof Revocation** mechanism
5. **Create Verifier Dashboard** for service providers
6. **Add Social Recovery** for wallet management

## Troubleshooting

### "Age verification failed"
- Ensure date of birth makes user older than minAge
- Check date format is YYYY-MM-DD

### "Proof verification failed"
- Identity data must match exactly
- Check spelling and formatting

### "Transaction failed"
- Ensure Sepolia testnet selected in wallet
- Check sufficient gas balance
- Verify contract address is correct

## References

- [Zero-Knowledge Proofs Explained](https://blog.cryptographyengineering.com/2014/11/27/zero-knowledge-proofs-illustrated-primer/)
- [SHA-256 Hash Function](https://en.wikipedia.org/wiki/SHA-2)
- [Ethereum Smart Contracts](https://ethereum.org/en/developers/docs/smart-contracts/)
- [ZK-SNARKs Guide](https://blog.chain.link/zk-snarks/)
