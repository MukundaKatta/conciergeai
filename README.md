# ConciergeAI

> Enterprise AI Customer Experience Agent Builder

ConciergeAI is a comprehensive platform for building, managing, and deploying AI-powered customer experience agents. Design intelligent conversational agents, track conversations, run A/B tests, and monitor performance through rich analytics dashboards.

## Features

- **AI Agent Builder** -- Create and configure intelligent customer experience agents
- **Knowledge Base Management** -- Upload and organize documents for agent grounding
- **Conversation Monitoring** -- Real-time tracking of all agent-customer interactions
- **Analytics Dashboard** -- Performance metrics, response quality, and engagement insights
- **A/B Testing** -- Compare agent configurations to optimize customer outcomes
- **Quality Assurance** -- Review and score agent responses for continuous improvement
- **Multi-Channel Deployment** -- Deploy agents across web, chat, and embeddable widgets
- **Embeddable Widget** -- Bundled chat widget for third-party website integration

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI API via Vercel AI SDK
- **State Management:** Zustand
- **Animation:** Framer Motion
- **Charts:** Recharts
- **Widget Bundler:** esbuild

## Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your SUPABASE_URL, SUPABASE_ANON_KEY, and OPENAI_API_KEY

# Run database migrations
npm run db:migrate

# Build the embeddable widget
npm run widget:build

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
  app/
    page.tsx              # Dashboard overview
    agents/               # Agent builder and management
    knowledge-base/       # Document upload and organization
    conversations/        # Conversation monitoring
    analytics/            # Performance analytics
    ab-testing/           # A/B test configuration
    quality-assurance/    # QA review interface
    channels/             # Deployment channel settings
  components/
    layout/               # App shell and navigation
    analytics/            # Dashboard charts and metrics
  lib/                    # Supabase client, utilities
widget/                   # Embeddable chat widget source
public/                   # Static assets and built widget
```

