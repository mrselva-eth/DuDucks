# Deployment Guide: ZK Identity Age Verification

## Quick Start (Development)

### 1. Clone and Install
```bash
git clone <repository>
cd zkp-identity
npm install
```

### 2. Setup Supabase
1. Create a new project at [supabase.com](https://supabase.com)
2. Get your credentials:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`

3. Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Setup Database
```bash
# Run SQL migration in Supabase SQL editor
# Copy contents of: scripts/01-zkp-identity-schema.sql
# Paste in Supabase SQL console and execute
```

### 4. Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Production Deployment

### Vercel Deployment

#### Step 1: Connect Repository
```bash
# If using GitHub
git push origin main

# Or use Vercel CLI
npm i -g vercel
vercel
```

#### Step 2: Set Environment Variables
In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Add:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

#### Step 3: Deploy
```bash
vercel --prod
```

### Smart Contract Deployment

#### Prerequisites
```bash
npm install -g truffle
npm install -g @openzeppelin/hardhat-upgrades
npm install @openzeppelin/contracts
npm install hardhat
npm install hardhat-ethers ethers
```

#### Setup Hardhat Project
```bash
npx hardhat init

# Select: Create a sample project
# Install dependencies when prompted
```

#### Deploy to Sepolia
1. **Get Test ETH**
   - Go to [Sepolia Faucet](https://sepoliafaucet.com)
   - Send ETH to your wallet

2. **Create `.env`** (for deployment):
```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR-PROJECT-ID
PRIVATE_KEY=your-wallet-private-key
ETHERSCAN_API_KEY=your-etherscan-api-key
```

3. **Create `scripts/deploy.js`**:
```javascript
const hre = require("hardhat");

async function main() {
  console.log("Deploying AgeVerificationZKP...");
  
  const AgeVerificationZKP = await hre.ethers.getContractFactory("AgeVerificationZKP");
  const contract = await AgeVerificationZKP.deploy();
  
  await contract.deployed();
  
  console.log("AgeVerificationZKP deployed to:", contract.address);
  
  // Verify on Etherscan
  console.log("Verifying contract...");
  await hre.run("verify:verify", {
    address: contract.address,
    constructorArguments: [],
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

4. **Copy contract to `contracts/AgeVerificationZKP.sol`**

5. **Deploy**:
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

6. **Update contract address in frontend**:
```typescript
// Update in component or environment variable
const CONTRACT_ADDRESS = "0x...";
```

### Database Backup

#### Supabase Automatic Backup
- Supabase handles daily backups automatically
- Access backups in Dashboard → Database → Backups

#### Manual Backup
```bash
# Export data
pg_dump postgresql://user:password@host/database > backup.sql

# Import data
psql postgresql://user:password@host/database < backup.sql
```

## Monitoring & Maintenance

### Health Checks
1. **Frontend**: Monitor Vercel deployment
2. **Database**: Check Supabase dashboard
3. **Smart Contract**: Use Etherscan explorer
4. **API Routes**: Check Vercel function logs

### Logs
```bash
# Vercel logs
vercel logs

# Supabase logs
# Dashboard → Logs

# Smart contract events
# Etherscan contract → Events tab
```

### Updates
```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm update

# Deploy
vercel --prod
```

## Security Checklist

- [ ] Environment variables never committed to git
- [ ] Supabase service role key restricted
- [ ] Private key stored in .env (not committed)
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Rate limiting configured (if needed)
- [ ] Input validation on all endpoints
- [ ] Database backups configured
- [ ] Smart contract audited (for production)
- [ ] Error monitoring setup (Sentry, etc.)
- [ ] GDPR compliance reviewed

## Troubleshooting

### Deployment Issues

#### "Build failed"
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm ci

# Check for TypeScript errors
npm run build
```

#### "Supabase connection failed"
- Verify environment variables
- Check IP whitelist in Supabase
- Ensure service role key has correct permissions

#### "Smart contract deploy failed"
- Verify private key and RPC URL
- Check gas estimates
- Ensure sufficient ETH balance

### Runtime Issues

#### "Proof generation fails"
- Check Supabase connection
- Verify user ID format
- Check document file size

#### "Verification fails"
- Ensure identity data matches exactly
- Check proof hasn't expired
- Verify salt is stored correctly

## Performance Optimization

### Frontend
```typescript
// Code splitting
const ProofDisplay = dynamic(() => import('@/components/zkp/proof-display'));

// Image optimization
import Image from 'next/image';
```

### Database
```sql
-- Add indexes for common queries
CREATE INDEX idx_user_proofs ON zk_proofs(user_id);
CREATE INDEX idx_onchain_status ON on_chain_proofs(status);
```

### API Routes
```typescript
// Add caching headers
res.setHeader('Cache-Control', 'max-age=3600');
```

## Scaling Considerations

### High Traffic
1. Enable Supabase connection pooling
2. Add CDN for static assets
3. Implement rate limiting
4. Use Redis for caching (Upstash)

### Database Growth
1. Archive old proofs
2. Implement pagination
3. Add database indexes
4. Consider data sharding

### Smart Contract
1. Upgrade to batch operations
2. Consider L2 solutions (Polygon, Arbitrum)
3. Implement proof compression

## Cost Estimates

### Supabase
- Free tier: Up to 500MB
- Growth plan: $25/month + usage
- Pro plan: $100/month + usage

### Vercel
- Free tier: Sufficient for development
- Pro: $20/month
- Enterprise: Custom pricing

### Sepolia Testnet
- Free test ETH from faucet
- Minimal gas costs

### Mainnet (Future)
- ~$2-5 per proof submission (varies)
- ~$1000+ for contract deployment

## Post-Launch

1. **Monitor analytics** - Track proof generation and verification rates
2. **Gather feedback** - User experience improvements
3. **Security updates** - Keep dependencies updated
4. **Feature additions** - Multi-attribute proofs, revocation
5. **Compliance** - GDPR, privacy policy updates

## Support

For issues:
1. Check [Supabase docs](https://supabase.com/docs)
2. Review [Ethereum docs](https://ethereum.org/developers)
3. Check [Vercel deployment guide](https://vercel.com/docs)
4. Create GitHub issue with details

## License

MIT - See LICENSE file for details
