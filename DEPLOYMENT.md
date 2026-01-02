# Oh-liro Deployment Guide

## Quick Deploy to Vercel

### Prerequisites
1. Vercel account
2. PostgreSQL database (Neon, Supabase, or Railway)
3. Redis instance (Upstash recommended for serverless)
4. OpenAI API key
5. (Optional) Resend account for email
6. (Optional) Twilio account for WhatsApp

---

## Step 1: Deploy Database

### Option A: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Format: `postgresql://user:pass@ep-xxx.neon.tech/ohliro?sslmode=require`

### Option B: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Use the "URI" format with your password

### Option C: Railway
1. Go to [railway.app](https://railway.app)
2. Add PostgreSQL plugin
3. Copy the DATABASE_URL from variables

---

## Step 2: Deploy Redis

### Option A: Upstash (Recommended for Serverless)
1. Go to [upstash.com](https://upstash.com)
2. Create a new Redis database
3. Choose the region closest to your Vercel region
4. Copy the REST URL (starts with `rediss://`)

### Option B: Railway
1. Add Redis plugin to your Railway project
2. Copy the REDIS_URL from variables

---

## Step 3: Deploy to Vercel

### Via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd support-platform
vercel

# Follow prompts to link to your project
```

### Via GitHub Integration
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Configure:
   - Framework: Next.js
   - Root Directory: `./`
   - Build Command: `pnpm turbo build --filter=@support-platform/web`
   - Output Directory: `apps/web/.next`

---

## Step 4: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

### Required
| Variable | Value | Environment |
|----------|-------|-------------|
| `DATABASE_URL` | Your PostgreSQL URL | All |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` | All |
| `NEXTAUTH_URL` | Your Vercel URL | Production |
| `OPENAI_API_KEY` | Your OpenAI key | All |
| `REDIS_URL` | Your Redis URL | All |

### Optional (Email)
| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | Your Resend key |
| `EMAIL_FROM_ADDRESS` | `support@yourdomain.com` |

### Optional (WhatsApp)
| Variable | Value |
|----------|-------|
| `TWILIO_ACCOUNT_SID` | Your Twilio SID |
| `TWILIO_AUTH_TOKEN` | Your Twilio token |
| `TWILIO_WHATSAPP_NUMBER` | Your WhatsApp number |

---

## Step 5: Run Database Migrations

After first deployment:
```bash
# Locally with production DATABASE_URL
DATABASE_URL="your-production-url" pnpm db:push
```

Or add a migration step to your CI/CD pipeline (already included in `.github/workflows/ci.yml`).

---

## Step 6: Configure Webhooks

### Email (Resend)
1. Go to Resend Dashboard → Webhooks
2. Add endpoint: `https://your-domain.vercel.app/api/webhooks/email`
3. Select events: `email.received`, `email.delivered`, `email.bounced`
4. Copy signing secret to `RESEND_WEBHOOK_SECRET`

### WhatsApp (Twilio)
1. Go to Twilio Console → WhatsApp Sandbox
2. Set webhook URL: `https://your-domain.vercel.app/api/webhooks/whatsapp`
3. Set method: POST

---

## Step 7: Custom Domain (Optional)

1. In Vercel Dashboard → Settings → Domains
2. Add your domain (e.g., `app.oh-liro.com`)
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` to your custom domain

---

## Monitoring & Logs

### Vercel Logs
- View real-time logs in Vercel Dashboard → Deployments → Functions

### Error Tracking (Recommended)
Add Sentry for production error monitoring:
```bash
pnpm add @sentry/nextjs
```

---

## Scaling Considerations

| Component | Free Tier | Scale |
|-----------|-----------|-------|
| Vercel | 100GB bandwidth | Pro plan |
| Neon | 500MB storage | Scale plan |
| Upstash | 10K commands/day | Pay as you go |
| OpenAI | N/A | Monitor usage |

---

## Troubleshooting

### Build Fails
- Check Prisma generation: `pnpm db:generate` in build
- Verify all env vars are set

### Database Connection
- Ensure SSL mode in connection string
- Check IP allowlist if using Supabase

### Webhooks Not Working
- Verify webhook URL is correct
- Check Vercel function logs
- Ensure signature verification is working
