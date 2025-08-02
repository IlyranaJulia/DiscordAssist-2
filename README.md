# DiscordAssist-2

A comprehensive Discord bot management platform for AI-powered customer support. Built with React, Express, and TypeScript.

## 🚀 Quick Start

### Local Development (Recommended)
```bash
# Run setup script
./scripts/setup-local.sh

# Update Discord credentials in .env
# Start development server
npm run dev
```

Visit `http://localhost:5000` to access the dashboard.

### Manual Setup
1. Install dependencies: `npm install`
2. Create `.env` file (see `setup-env.md`)
3. Configure Discord application (see `local-setup.md`)
4. Start server: `npm run dev`

## 📋 Features

- **Discord OAuth Authentication** - Secure login with Discord accounts
- **Bot Configuration Management** - Configure bots for multiple Discord servers
- **AI-Powered Responses** - OpenAI/OpenRouter integration for smart suggestions
- **Policy Management** - Upload and manage custom policy documents
- **Analytics Dashboard** - Track usage, success rates, and user feedback
- **Multi-Guild Support** - Manage bots across multiple Discord servers
- **Local Development** - Hot reload and SQLite for easy development

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Wouter, TanStack Query
- **UI**: shadcn/ui, Radix UI, Tailwind CSS
- **Backend**: Express.js, TypeScript
- **Database**: SQLite (local), PostgreSQL (production)
- **AI**: OpenAI GPT-4o, OpenRouter APIs
- **Authentication**: Discord OAuth 2.0

## 📁 Project Structure

```
DiscordAssist-2/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                 # Express backend
│   ├── routes.ts          # API routes
│   ├── storage.ts         # Database layer
│   └── config.ts          # Configuration
├── shared/                 # Shared types
└── scripts/               # Setup scripts
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Start production server
npm run db:push     # Push database schema
npm run check       # TypeScript type checking
```

### Environment Variables
```bash
# Required
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
SESSION_SECRET=your_session_secret

# Optional
DATABASE_URL=your_database_url
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
```

## 📚 Documentation

- [Quick Start Guide](quick-start.md) - Get running in 5 minutes
- [Local Setup Guide](local-setup.md) - Detailed local development setup
- [Environment Setup](setup-env.md) - Discord OAuth configuration

## 🚀 Deployment

### Local Production
```bash
npm run build
npm start
```

### Cloud Deployment
- **Railway**: Connect GitHub repo
- **Render**: Deploy from Git
- **Vercel**: Frontend + API routes
- **Heroku**: Full-stack deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

---

**DiscordAssist-2** - Making Discord bot management simple and powerful! 🤖✨ 