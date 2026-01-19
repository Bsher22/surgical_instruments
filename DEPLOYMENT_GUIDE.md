# SurgicalPrep Deployment Guide

Complete instructions for deploying the SurgicalPrep application:
- **Backend API + Database**: Railway (FastAPI + PostgreSQL)
- **Image Storage**: Cloudflare R2
- **Frontend**: Cloudflare Pages (web) or Expo EAS (iOS/Android)

**Stack Summary:**
| Component | Service | Cost |
|-----------|---------|------|
| Backend API | Railway | Free tier / $5+/mo |
| Database | Railway PostgreSQL | Included |
| Image Storage | Cloudflare R2 | 10GB free |
| Web Frontend | Cloudflare Pages | Free |
| Mobile Apps | Expo EAS | Free builds |

---

## Prerequisites

1. **Accounts Required**:
   - [Railway](https://railway.app) - Backend + Database
   - [Cloudflare](https://cloudflare.com) - R2 Storage + Web hosting
   - [Expo](https://expo.dev) - Mobile app builds
   - [Stripe](https://stripe.com) - Payments (for premium features)

2. **Local Tools**:
   - Node.js 20+
   - Python 3.11+
   - Git
   - Expo CLI: `npm install -g eas-cli`

---

## Part 1: Database Setup (Railway PostgreSQL)

### Step 1: Create Railway Project

1. Go to [railway.app](https://railway.app) and create account
2. Click **New Project** > **Empty Project**
3. Click **Add Service** > **Database** > **PostgreSQL**
4. Wait for database to provision (~30 seconds)

### Step 2: Get Database Connection String

1. Click on the PostgreSQL service
2. Go to **Variables** tab
3. Copy `DATABASE_URL`
4. Modify it for async: change `postgres://` to `postgresql+asyncpg://`

### Step 3: Run Database Schema

**Option A: Via Railway CLI**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Run schema
railway run psql -f surgicalprep-backend/database/schema.sql
```

**Option B: Via Database GUI**
1. In Railway, click PostgreSQL service
2. Click **Data** tab > **Query**
3. Copy/paste contents of `surgicalprep-backend/database/schema.sql`
4. Click **Run**

---

## Part 2: Cloudflare R2 Storage Setup

### Step 1: Create R2 Bucket

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Click **R2** in sidebar
3. Click **Create bucket**
4. Name: `surgicalprep-images`
5. Click **Create bucket**

### Step 2: Enable Public Access

1. Click on your bucket
2. Go to **Settings** tab
3. Under **Public access**, click **Allow Access**
4. Copy the public URL (e.g., `https://pub-xxx.r2.dev`)

### Step 3: Create API Token

1. Go to **R2** > **Manage R2 API Tokens**
2. Click **Create API Token**
3. Name: `surgicalprep-backend`
4. Permissions: **Object Read & Write**
5. Specify bucket: `surgicalprep-images`
6. Click **Create API Token**
7. **Save these values** (shown only once):
   - Access Key ID → `R2_ACCESS_KEY_ID`
   - Secret Access Key → `R2_SECRET_ACCESS_KEY`

### Step 4: Get Account ID

1. Go to any Cloudflare dashboard page
2. Look at URL: `dash.cloudflare.com/[ACCOUNT_ID]/...`
3. Save this as `R2_ACCOUNT_ID`

---

## Part 3: Backend Deployment (Railway)

### Step 1: Deploy Backend Service

1. In your Railway project, click **Add Service** > **GitHub Repo**
2. Select your repository
3. Set **Root Directory**: `surgicalprep-backend`
4. Railway auto-detects Python and deploys

**Or via CLI:**
```bash
cd surgicalprep-backend
railway up
```

### Step 2: Configure Environment Variables

In Railway dashboard, click your backend service > **Variables** tab.

Add these variables:

```env
# Database (Railway provides this - link to your PostgreSQL service)
DATABASE_URL=${POSTGRES_URL}

# Authentication (generate with: openssl rand -hex 32)
SECRET_KEY=your-secret-key-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Cloudflare R2 Storage
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key
R2_SECRET_ACCESS_KEY=your-r2-secret-key
R2_BUCKET_NAME=surgicalprep-images
R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Stripe
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_ANNUAL=price_...

# CORS (add your frontend domains)
CORS_ORIGINS=["https://surgicalprep.pages.dev","http://localhost:8081"]

# Free tier limits
FREE_TIER_CARDS_LIMIT=5
FREE_TIER_DAILY_QUIZZES=3
```

### Step 3: Link Database

1. Click **Variables** tab
2. Click **Add Variable Reference**
3. Select your PostgreSQL service
4. Add `DATABASE_URL` reference

### Step 4: Generate Domain

1. Go to **Settings** > **Networking**
2. Click **Generate Domain**
3. Save the URL (e.g., `https://surgicalprep-api.up.railway.app`)

### Step 5: Verify Deployment

```bash
# Test health endpoint
curl https://your-app.up.railway.app/health
# Should return: {"status": "healthy"}

# View API docs
open https://your-app.up.railway.app/docs
```

---

## Part 4: Frontend Deployment

### Option A: Cloudflare Pages (Web)

#### Step 1: Build Web Version

```bash
cd surgicalprep-mobile

# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Edit .env.local with your Railway API URL
# EXPO_PUBLIC_API_URL=https://your-app.up.railway.app

# Build for web
npx expo export:web
```

#### Step 2: Deploy to Cloudflare Pages

**Via Wrangler CLI (Recommended):**
```bash
# Install Wrangler
npm install -g wrangler

# Login
wrangler login

# Deploy
wrangler pages deploy dist --project-name=surgicalprep
```

**Via Dashboard:**
1. Go to Cloudflare Dashboard > **Pages**
2. Click **Create a project** > **Direct Upload**
3. Upload the `dist/` folder
4. Name your project

#### Step 3: Set Environment Variables

In Cloudflare Pages > Settings > Environment variables:

```env
EXPO_PUBLIC_API_URL=https://your-app.up.railway.app
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

---

### Option B: Expo EAS (iOS/Android)

#### Step 1: Configure EAS

```bash
cd surgicalprep-mobile

# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure
```

#### Step 2: Update eas.json

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://your-app.up.railway.app",
        "EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY": "@stripe_publishable_key"
      }
    }
  }
}
```

#### Step 3: Build and Submit

```bash
# Add secrets
eas secret:create --name STRIPE_PUBLISHABLE_KEY --value pk_live_xxx

# Build for both platforms
eas build --platform all --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## Part 5: Stripe Configuration

### Step 1: Create Products

1. Go to Stripe Dashboard > Products
2. Create two products:
   - **Monthly Premium**: $4.99/month
   - **Annual Premium**: $29.99/year
3. Save the Price IDs

### Step 2: Configure Webhooks

1. Go to Stripe > Developers > Webhooks
2. Add endpoint: `https://your-app.up.railway.app/api/subscriptions/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Save the Webhook Secret

---

## Part 6: Seed Production Data

```bash
cd surgicalprep-backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variable
export DATABASE_URL="your-railway-database-url"

# Run seed scripts
python scripts/seed_instruments.py
python scripts/seed_templates.py
```

---

## Quick Reference

### Railway Commands
```bash
railway login          # Login
railway link           # Link to project
railway up             # Deploy
railway logs           # View logs
railway run <cmd>      # Run command with env vars
```

### Wrangler Commands (Cloudflare)
```bash
wrangler login                    # Login
wrangler pages deploy dist        # Deploy to Pages
wrangler r2 object put <bucket>/<key> --file=<path>  # Upload to R2
```

### EAS Commands (Expo)
```bash
eas login                         # Login
eas build --platform all          # Build apps
eas submit --platform ios         # Submit to App Store
eas submit --platform android     # Submit to Play Store
```

---

## Post-Deployment Checklist

### Backend
- [ ] Health endpoint returns 200
- [ ] API docs accessible at `/docs`
- [ ] Database connected
- [ ] R2 uploads working
- [ ] Stripe webhooks receiving

### Frontend
- [ ] App loads without errors
- [ ] Login/signup works
- [ ] Image uploads work
- [ ] Premium features gated

---

## Cost Estimate

| Service | Free Tier | Paid |
|---------|-----------|------|
| Railway | 500 hours/month | $5/month |
| Railway PostgreSQL | 1GB included | $5/month after |
| Cloudflare R2 | 10GB storage, 1M requests | $0.015/GB |
| Cloudflare Pages | Unlimited | Free |
| Expo EAS | 30 builds/month | $99/month for more |

**Estimated monthly cost for small app: $5-15/month**

---

## Troubleshooting

**Database connection fails:**
- Ensure DATABASE_URL uses `postgresql+asyncpg://`
- Check Railway PostgreSQL service is running
- Verify connection in Railway > PostgreSQL > Data tab

**R2 uploads fail:**
- Verify R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY are correct
- Check bucket name matches
- Ensure bucket has public access enabled

**CORS errors:**
- Add your frontend domain to CORS_ORIGINS
- Include both http and https versions

**Build fails:**
- Check Python 3.11+ is being used
- Verify all dependencies in requirements.txt

---

## Support

- **Railway Docs**: https://docs.railway.app
- **Cloudflare R2**: https://developers.cloudflare.com/r2
- **Cloudflare Pages**: https://developers.cloudflare.com/pages
- **Expo EAS**: https://docs.expo.dev/eas
