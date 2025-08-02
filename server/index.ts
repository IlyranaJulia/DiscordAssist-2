import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";
import { getConfig, validateConfig } from "./config";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configuration validation
const configErrors = validateConfig();
if (configErrors.length > 0) {
  console.error('❌ Configuration errors:');
  configErrors.forEach(error => console.error(`  - ${error}`));
  process.exit(1);
}
const config = getConfig();

// Session middleware
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for development
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
  });
}

// Start the server
async function startServer() {
  // Register API routes
  const server = await registerRoutes(app);

  // Serve static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('client/dist'));
    
    // Serve index.html for all routes (SPA routing)
    app.get('*', (req, res) => {
      res.sendFile('index.html', { root: 'client/dist' });
    });
  } else {
    // Development: Use Vite dev server
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  // Start server
  server.listen(PORT, () => {
    console.log(`🚀 DiscordAssist-2 running on port ${PORT}`);
    console.log(`📊 Storage type: ${config.storageType}`);
    console.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    if (process.env.NODE_ENV === 'production') {
      console.log(`🌐 Production URL: ${process.env.RAILWAY_PUBLIC_DOMAIN || 'https://your-app.railway.app'}`);
    }
  });
}

startServer().catch(console.error);
