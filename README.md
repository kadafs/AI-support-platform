# Oh-liro — AI That Listens First

> 🎧 AI-powered customer support that actually understands your customers

## Overview

Oh-liro is a modern, AI-first customer support platform designed for small and medium businesses. It listens, understands, and responds with empathy — combining conversational AI, live chat, email, and WhatsApp messaging into a single unified inbox.

## Features

- 🎧 **Listens First** — Understands context and intent before responding
- ⚡ **Instant & Accurate** — GPT-4 powered responses with confidence scoring
- 💬 **Unified Inbox** — All channels in one place
- 🔄 **Seamless Handoff** — AI knows when to escalate to humans
- 🧠 **Knowledge Base** — Train AI from your website, Q&A, or CSV files
- 📱 **Multi-Channel** — Live Chat, Email, WhatsApp
- 🔌 **WordPress Plugin** — Easy widget installation

## Project Structure

```
support-platform/
├── apps/
│   ├── web/                  # Next.js admin dashboard
│   ├── widget/               # Embeddable chat widget
│   └── wordpress-plugin/     # WordPress plugin
├── packages/
│   ├── database/             # Prisma schema & client
│   ├── ai-engine/            # AI orchestration
│   ├── jobs/                 # Background job processing
│   └── shared/               # Shared types & utilities
└── .env.example              # Environment template
```

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL 15+
- Redis (for job queue)
- OpenAI API key

### Installation

```bash
# Clone the repo
git clone https://github.com/kadafs/AI-support-platform.git
cd support-platform

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Set up database
pnpm db:generate
pnpm db:push

# Start development server
pnpm dev
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth.js secret key |
| `OPENAI_API_KEY` | OpenAI API key for AI responses |
| `REDIS_URL` | Redis URL for job queue |
| `RESEND_API_KEY` | Email sending (optional) |
| `TWILIO_*` | WhatsApp integration (optional) |

## Development

```bash
# Run all apps in development
pnpm dev

# Run specific app
pnpm --filter @support-platform/web dev

# Start job worker
pnpm --filter @support-platform/jobs worker

# Database operations
pnpm db:studio    # Open Prisma Studio
pnpm db:migrate   # Run migrations

# Build for production
pnpm build
```

## Widget Installation

### Option 1: Script Tag
```html
<script 
  src="https://cdn.oh-liro.com/widget.js"
  data-workspace-id="YOUR_WORKSPACE_ID"
  data-primary-color="#8b5cf6"
></script>
```

### Option 2: WordPress Plugin
1. Upload `wordpress-plugin/` to `/wp-content/plugins/`
2. Activate the plugin
3. Go to Oh-liro settings
4. Enter your Workspace ID

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, Tailwind CSS |
| Backend | Next.js API Routes |
| Database | PostgreSQL, Prisma |
| AI | OpenAI GPT-4o |
| Real-time | Socket.io |
| Jobs | BullMQ, Redis |
| Widget | Vanilla JS, Vite |

## License

MIT

---

Built with ❤️ by the Oh-liro team
