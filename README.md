# Ambr

```
      ▄                             ▄▄
      ▀▓▓                           ▓▓
     ▀  ▓▓      ▓▓▄   ▀▓▄   ▄▀▀▓▄   ▓▓▄▄▄▄▀▀▓▓▄    ▀▌▄▀▀▀▀▓▓▄
   ▄▀   ▓▓▓     ▓▓      ▓▓     ▐▓▌  ▓▓        ▀▓▓▄  ▓▌
  ▄   ▄▓▓▀▓▌    ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌
 ▀  ▄▓▀    ▓▌   ▓▓      ▐▓      ▓▌  ▓▓          ▓▓  ▓▌
▐▄▄▓▀      ▐▓▌  ▓▓      ▐▓      ▓▌  ▓▓█▄▄  ▄▄▄▓▀    ▓▌
```

**Share ideas worth protecting.**

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Security Model](#security-model)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Development](#development)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Third-Party Services](#third-party-services)
- [Security Considerations](#security-considerations)
- [Contributing](#contributing)
- [License](#license)

## Overview

Ambr is a secure, blockchain-backed file transfer service that provides verifiable proof of origin and authenticity for shared files. Unlike traditional file sharing platforms, Ambr empowers creators by giving them control over their work through cryptographic verification, blockchain timestamping, and NFT-based ownership records.

Every file shared through Ambr receives a tamper-proof, time-stamped digital fingerprint that is cryptographically linked to the creator's identity and secured on the Polygon blockchain. This ensures undeniable proof of creative ownership and authenticity.

## Features

### Core Functionality

- **End-to-End Encryption**: Files are encrypted client-side using Web Crypto API before transmission
- **Blockchain Verification**: Every transfer is recorded on Polygon blockchain with immutable timestamps
- **NFT Minting**: Automatic NFT creation for each file transfer, providing proof of ownership
- **WebTorrent P2P**: Peer-to-peer file transfer using WebTorrent protocol for efficient distribution
- **Cloud Storage Fallback**: Backblaze B2 cloud storage for reliable file availability
- **IPFS Integration**: Metadata storage on IPFS via NFT.Storage for decentralized persistence
- **Wallet Authentication**: Magic Link integration for passwordless, wallet-based authentication
- **Stripe Integration**: Payment processing for premium features

### Security Features

- **Client-Side Encryption**: AES-GCM encryption with RFC 8188 compliance
- **SHA-256 File Hashing**: Unique cryptographic fingerprints for file verification
- **Content Security Policy**: Strict CSP headers to prevent XSS attacks
- **HMAC Authentication**: Reader authorization tokens for secure downloads
- **Encrypted Metadata**: All file metadata encrypted before storage
- **Privacy-First Design**: User data hashed at rest, minimal data retention

## Architecture

### High-Level Design

Ambr follows a hybrid architecture combining:

- **Client-Side Processing**: Encryption, hashing, and file preparation in the browser
- **Server-Side Coordination**: WebSocket-based signaling and state management
- **Blockchain Layer**: Smart contract interactions for NFT minting and verification
- **Storage Layer**: Dual storage (P2P + Cloud) for redundancy and availability
- **Database Layer**: CockroachDB for distributed, fault-tolerant metadata storage

### Data Flow

#### Upload Flow

1. User selects files in browser
2. Client generates cryptographic keys using Web Crypto API
3. SHA-256 hash computed for each file
4. Files encrypted client-side with AES-GCM
5. Encrypted files uploaded to Backblaze B2 cloud storage
6. WebTorrent torrent created for P2P distribution
7. Metadata encrypted and stored in database
8. Smart contract called to mint NFT on Polygon
9. Transaction hash and IPFS CID stored
10. Unique shareable link generated with secret key in URL fragment

#### Download Flow

1. Downloader accesses link with embedded secret key
2. Client extracts roomId and key from URL
3. Server provides encrypted metadata (salt, torrent info)
4. Client derives decryption keys using PBKDF2
5. HMAC token generated for authentication
6. Files fetched via WebTorrent P2P or B2 cloud fallback
7. Files decrypted in browser using derived keys
8. Plaintext files presented to user
9. Download counter decremented in database

#### Blockchain Verification Flow

1. File hash stored on Polygon via smart contract
2. Creator address linked to file hash
3. Recipient addresses recorded in metadata
4. NFT minted with IPFS metadata URI
5. Transaction provides immutable timestamp
6. Public verification possible via blockchain explorer

## Technology Stack

### Frontend

- **Framework**: Next.js 12.1.6 (React 18.1.0)
- **UI Library**: Chakra UI 2.1.2
- **Styling**: Emotion, Framer Motion
- **Forms**: Formik + Yup validation
- **File Transfer**: WebTorrent 1.9.7
- **Crypto**: Web Crypto API, crypto-js
- **State Management**: React Context API
- **Storage**: IndexedDB (idb 7.0.2)

### Backend

- **Runtime**: Node.js
- **Framework**: Next.js API Routes
- **Database**: CockroachDB (via Prisma 4.11.0)
- **ORM**: Prisma Client
- **WebSocket**: Socket.io 4.5.1
- **File Storage**: Backblaze B2 (backblaze-b2 1.7.0)
- **Email**: Nodemailer 6.9.1

### Blockchain

- **Network**: Polygon (Mainnet/Mumbai Testnet)
- **Library**: Ethers.js 5.7.2
- **Smart Contract**: ERC-721 NFT with custom roles
- **Wallet**: Magic Link SDK 13.4.0
- **IPFS**: NFT.Storage 7.0.0

### Infrastructure

- **Hosting**: Vercel
- **Database**: CockroachDB Cloud
- **Storage**: Backblaze B2
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry 7.2.0
- **Payments**: Stripe 11.14.0

## Security Model

### Encryption Architecture

Ambr implements a defense-in-depth security model:

1. **Key Derivation**: Main secret key generated using Web Crypto API
2. **Salt Generation**: Unique cryptographic salt per transfer
3. **Key Hierarchy**: Master key derives file encryption keys, metadata key, and auth tokens
4. **File Encryption**: RFC 8188 (AES-GCM) for file content
5. **Metadata Encryption**: Separate AES-GCM encryption for metadata
6. **Authentication**: HMAC SHA-256 for download authorization

### Privacy Features

- **Zero-Knowledge Storage**: Server cannot decrypt user files
- **Hashed Identifiers**: User addresses hashed before database storage
- **Minimal Metadata**: Only essential metadata retained
- **Automatic Expiry**: Files auto-deleted after configured lifetime (default 72 hours)
- **Download Limits**: Configurable maximum downloads per transfer
- **URL Fragment Secrets**: Encryption keys never sent to server (stored in # fragment)

### Security Headers

Comprehensive security headers configured in `vercel.json`:

- **Content-Security-Policy**: Strict CSP to prevent XSS
- **X-Frame-Options**: DENY to prevent clickjacking
- **X-Content-Type-Options**: nosniff to prevent MIME sniffing
- **Strict-Transport-Security**: Force HTTPS connections
- **Cross-Origin Policies**: Isolate origin for enhanced security

## Project Structure

```
ambr/
├── components/          # React components
│   ├── icons/          # SVG icons and logo components
│   ├── pages/          # Page-specific components
│   ├── AmbrContext.js  # Global app context
│   └── MagicContext.js # Wallet authentication context
├── contracts/          # Smart contract ABIs
│   └── ambrABI.js     # ERC-721 NFT contract interface
├── hooks/              # Custom React hooks
├── lib/                # Core business logic
│   ├── Room.js         # Room/transfer management
│   ├── Send.js         # Upload/download orchestration
│   ├── encrypted-torrent.js  # WebTorrent encryption
│   ├── file-hash.js    # SHA-256 hashing
│   ├── make-hash.js    # Utility hashing functions
│   ├── sentry.js       # Error tracking
│   └── UserManager.js  # User data management
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   │   ├── room/       # Room-specific endpoints
│   │   ├── cron.js     # Scheduled cleanup job
│   │   ├── mint-state/ # NFT minting endpoints
│   │   └── payment-*   # Stripe payment handlers
│   ├── _app.js         # Next.js app wrapper
│   └── index.js        # Landing page
├── prisma/             # Database schema
│   └── schema.prisma   # Prisma ORM schema definition
├── public/             # Static assets
├── theme/              # Chakra UI theme configuration
├── config.js           # Application configuration
├── next.config.js      # Next.js configuration
├── vercel.json         # Vercel deployment config
└── package.json        # Dependencies and scripts
```

## Prerequisites

- Node.js >= 12.22.0
- npm >= 7.0.0
- CockroachDB database (cloud or local)
- Backblaze B2 account
- Polygon RPC endpoint
- Magic Link account
- NFT.Storage API key
- Stripe account (for payments)

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd ambr

# Install dependencies
npm install

# Generate Prisma client
npx prisma generate
```

## Environment Configuration

Create a `.env` file in the project root with the following variables:

### Required Environment Variables

```bash
# Application
REACT_APP_NODE_ENV=development          # development | production
REACT_APP_PORT=3000
REACT_APP_HOSTNAME=localhost:3000

# Database
DATABASE_URL=<cockroachdb-connection-string>

# Backblaze B2 Storage
REACT_APP_B2_APP_KEY_ID=<b2-key-id>
REACT_APP_B2_APP_KEY=<b2-app-key>
REACT_APP_B2_DEV_NAME=<bucket-name>
REACT_APP_B2_DEV_ID=<bucket-id>
REACT_APP_B2_MASTER_KEY_ID=<master-key-id>
REACT_APP_B2_MASTER_KEY=<master-key>

# Blockchain
REACT_APP_CONTRACT_ADDRESS=<nft-contract-address>
REACT_APP_RPC_URL=<polygon-rpc-url>
REACT_APP_RPC_CHAIN_ID=137                    # 137 for Polygon Mainnet, 80001 for Mumbai
REACT_APP_ADMIN_PK=<admin-private-key>
BOT_PRIVATE_KEY=<bot-private-key>
POLYGONSCAN_API_KEY=<polygonscan-api-key>

# IPFS
REACT_APP_NFTSTORAGE_TOKEN=<nft-storage-api-key>
REACT_APP_IPFSGATEWAY=https://nftstorage.link
IPFS_API_URL=<ipfs-api-url>
IPFS_API_KEY=<ipfs-api-key>

# Magic Link (Wallet Auth)
REACT_APP_MAGIC_LINK_PK=<publishable-key>
REACT_APP_MAGIC_LINK_SK=<secret-key>

# Stripe Payments
REACT_APP_STRIPE_SK=<stripe-secret-key>

# Email (Optional)
REACT_APP_MAILR_ADDR=<smtp-email-address>
REACT_APP_MAILR_PW=<smtp-password>

# Deployment (Vercel/Render)
REACT_APP_RENDER=false
REACT_APP_IS_PULL_REQUEST=false
REACT_APP_RENDER_GIT_COMMIT=<git-commit-hash>
REACT_APP_RENDER_EXTERNAL_HOSTNAME=<hostname>
```

### Configuration Files

See `.env.example` for a template with all required variables.

## Database Setup

### Prisma Schema

The database uses three main models:

**Room**: Stores file transfer metadata

- `roomId`: Unique 5-character identifier
- `idHash`: Hashed user identifier for privacy
- `fileHash`: SHA-256 hash of file content
- `salt`: Cryptographic salt for key derivation
- `encryptedTorrentFile`: Encrypted WebTorrent metadata
- `cloudState`: Upload status to B2
- `mintState`: NFT minting status
- `cid`: IPFS content identifier
- `txHash`: Blockchain transaction hash
- `expiresAtTimestampMs`: Expiration timestamp
- `remainingDownloads`: Download counter

**User**: Stores user account data

- `id`: Auto-incrementing primary key
- `idHash`: Hashed wallet address
- `email`: User email (optional)
- `fileTransfersRemaining`: Available transfer credits

**Payment**: Tracks Stripe payments

- `paymentId`: Stripe payment intent ID
- `amount`: Payment amount in cents
- `transfers`: Credits purchased
- `status`: Payment status

### Migration Commands

```bash
# Create new migration
npx prisma migrate dev --name <migration-name>

# Apply migrations (production)
npx prisma migrate deploy

# Open Prisma Studio (database GUI)
npx prisma studio
```

## Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

### Development Workflow

1. **Local Database**: Use CockroachDB locally or connect to cloud instance
2. **Environment**: Copy `.env.example` to `.env` and configure
3. **Hot Reload**: Next.js provides automatic hot module replacement
4. **API Testing**: API routes available at `/api/*`
5. **Database GUI**: Use `npx prisma studio` for database inspection

## Deployment

### Vercel Deployment (Recommended)

Ambr is optimized for Vercel deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

#### Vercel Configuration

The `vercel.json` file includes:

- Security headers (CSP, HSTS, etc.)
- CORS configuration
- Cron job for file cleanup (daily at midnight)

#### Build Configuration

- **Build Command**: `prisma generate && prisma migrate deploy && next build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables

Set all environment variables in Vercel project settings:

1. Go to Project Settings > Environment Variables
2. Add each variable from `.env`
3. Separate variables for Production, Preview, and Development

### Post-Deployment

1. **Database Migrations**: Automatically run via `vercel-build` script
2. **Prisma Client**: Generated during build
3. **Static Assets**: Cached on Vercel Edge Network
4. **API Routes**: Deployed as serverless functions
5. **Cron Jobs**: Configured in `vercel.json` for cleanup tasks

## API Documentation

### Public API Endpoints

#### Room Management

**GET** `/api/room/[id]/join`

- Retrieves room metadata for download
- Requires valid roomId
- Returns room configuration including salt, cloud state, expiry

**POST** `/api/room/[id]/mint-state/minting`

- Updates NFT minting status
- Called during minting process

**GET** `/api/room/[id]/salt`

- Returns cryptographic salt for key derivation
- Unauthenticated endpoint

**GET** `/api/room/[id]/cloud-state`

- Returns B2 upload status
- Used to determine download method (P2P vs cloud)

#### Backblaze B2 Integration

**POST** `/api/room/[id]/b2/auth-upload`

- Requests upload authorization tokens
- Returns multiple tokens for parallel uploads
- Requires number of tokens in request body

**GET** `/api/room/[id]/b2/auth-download`

- Requests download authorization
- Returns download URL and token
- Valid for 7 days (604800 seconds)

**DELETE** `/api/room/[id]/b2/auth-delete`

- Deletes files from B2 storage
- Requires roomId and idHash
- Called on expiry or manual deletion

#### User Management

**GET** `/api/get-user?idHash=[hash]`

- Retrieves user account data
- Returns transfer credits and payment history

**PUT** `/api/update-user?id=[id]`

- Updates user transfer credits
- Called after successful payment or transfer

#### Payments

**POST** `/api/create-payment-intent`

- Creates Stripe payment intent
- Returns client secret for frontend

**POST** `/api/payment-outcome`

- Webhook for payment completion
- Updates user credits on success

### Cron Jobs

**GET** `/api/cron`

- Scheduled daily via Vercel cron
- Deletes expired files from B2
- Cleans up database records
- Runs at 00:00 UTC

## Third-Party Services

### Backblaze B2

- **Purpose**: Cloud file storage fallback
- **Configuration**: Application key credentials in environment
- **Bucket**: Single bucket per environment (dev/prod)
- **Lifecycle**: Files auto-expire based on room lifetime
- **Cost**: Pay-per-use storage and bandwidth

### Polygon Network

- **Purpose**: Blockchain verification and NFT minting
- **Network**: Mainnet (Chain ID 137) or Mumbai Testnet (80001)
- **Contract**: Custom ERC-721 with role-based access control
- **Gas**: Paid by admin wallet for minting operations
- **Explorer**: [PolygonScan](https://polygonscan.com)

### NFT.Storage

- **Purpose**: Decentralized metadata storage on IPFS
- **API**: Free tier available with API key
- **Content**: NFT metadata, file hashes, creator info
- **Permanence**: Content pinned to IPFS via Filecoin

### Magic Link

- **Purpose**: Passwordless wallet authentication
- **SDK**: Client and server-side integration
- **Network**: Configured for Polygon network
- **Features**: Email-based auth, embedded wallet

### Stripe

- **Purpose**: Payment processing for premium features
- **Products**: File transfer credits
- **Webhooks**: Payment confirmation and failure handling
- **Testing**: Test mode keys for development

### Sentry

- **Purpose**: Error tracking and performance monitoring
- **Integration**: Client and server-side monitoring
- **Privacy**: Secrets scrubbed before sending events
- **Sampling**: 1% transaction sampling rate

### Vercel

- **Purpose**: Hosting, CDN, serverless functions
- **Features**: Automatic deployments, preview URLs, edge caching
- **Regions**: Global CDN with edge functions
- **Cron**: Scheduled jobs for maintenance

## Security Considerations

### ⚠️ CRITICAL: Exposed Credentials

**SECURITY AUDIT FINDINGS:**

The codebase currently contains sensitive credentials exposed in:

1. **`next.config.js`**: Environment variables exposed to client bundle

   - All `REACT_APP_*` variables are bundled with client code
   - Including: API keys, private keys, RPC URLs, secret keys

2. **Risk Level**: **CRITICAL**
   - Private keys (`REACT_APP_ADMIN_PK`, `REACT_APP_MAGIC_LINK_SK`)
   - API keys (`REACT_APP_NFTSTORAGE_TOKEN`, `REACT_APP_B2_APP_KEY`)
   - Sensitive configuration exposed to all website visitors

### Immediate Actions Required

**DO NOT commit `.env` files to version control**

**Before pushing to GitHub:**

```bash
# Check for exposed secrets
git secrets --scan

# Review .gitignore
cat .gitignore | grep .env

# Remove any committed secrets
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

**Migrate sensitive environment variables:**

1. Move server-only secrets to Vercel environment variables
2. Only expose public keys to client (marked with `NEXT_PUBLIC_` prefix)
3. Use API routes for server-side operations requiring secrets
4. Rotate all exposed credentials immediately

**Recommended `.env` structure:**

```bash
# Client-side (safe to expose)
NEXT_PUBLIC_CONTRACT_ADDRESS=...
NEXT_PUBLIC_RPC_URL=...
NEXT_PUBLIC_CHAIN_ID=...
NEXT_PUBLIC_MAGIC_LINK_PK=...  # Public key only

# Server-side (NEVER expose to client)
DATABASE_URL=...
B2_APP_KEY=...
ADMIN_PRIVATE_KEY=...
MAGIC_LINK_SK=...
NFT_STORAGE_TOKEN=...
STRIPE_SECRET_KEY=...
```

**Update `next.config.js`:**

```javascript
// Remove env object entirely
// Use process.env directly in API routes only
// Use NEXT_PUBLIC_ prefix for client-accessible vars
```

### Security Best Practices

**For Development:**

- Use separate credentials for dev/staging/production
- Never commit `.env` files or secrets
- Use `.env.local` for local overrides (ignored by git)
- Rotate keys regularly

**For Production:**

- Store secrets in Vercel environment variables
- Enable secret scanning in GitHub
- Use role-based access control on cloud services
- Monitor for unauthorized access

**For Code:**

- Validate all user inputs
- Sanitize file names and metadata
- Rate limit API endpoints
- Implement CSRF protection
- Keep dependencies updated

### Threat Model

**Threats Mitigated:**

- ✅ Eavesdropping on file transfers (E2E encryption)
- ✅ Server compromise (zero-knowledge design)
- ✅ Man-in-the-middle attacks (HTTPS + SRI)
- ✅ Content tampering (cryptographic hashes)
- ✅ Replay attacks (time-bound tokens)
- ✅ XSS attacks (strict CSP)

**Residual Risks:**

- ⚠️ Client-side compromise (malware, browser extensions)
- ⚠️ Phishing attacks (user education required)
- ⚠️ Blockchain analysis (on-chain metadata visible)
- ⚠️ Storage provider access (encrypted at rest)

## Contributing

### Code Style

- ESLint configuration in `.eslintrc`
- Prettier for consistent formatting
- Conventional commits preferred

### Pull Request Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `npm run lint`
5. Test thoroughly
6. Submit PR with detailed description

### Development Guidelines

- Keep components small and focused
- Use TypeScript for new code when possible
- Add comments for complex logic
- Update documentation for API changes
- Write tests for critical paths

## License

MIT License - see LICENSE file for details

---

**Built with security and privacy at its core.**

For questions, issues, or security concerns:

- Email: opsec@ambr.link
- Security: Responsible disclosure appreciated

_Share ideas worth protecting._
