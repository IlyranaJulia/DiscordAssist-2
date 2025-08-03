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
      secure: false, // Set to false for now to fix session issues
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'lax',
    },
    name: 'discordassist.sid', // Custom session name
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
  try {
    console.log('🔧 Starting server...');
    
    // Register API routes first
    const server = await registerRoutes(app);
    console.log('✅ API routes registered');

    // Serve static files in production (after API routes)
    if (process.env.NODE_ENV === 'production') {
      console.log('📁 Setting up static file serving...');
      // Serve static files from the correct build directory
      app.use(express.static('client/dist'));
      
      // Serve index.html for all remaining routes (SPA routing)
      app.get('*', (req, res) => {
        console.log(`📄 Serving index.html for route: ${req.path}`);
        res.sendFile('index.html', { root: 'client/dist' });
      });
      console.log('✅ Static file serving configured');
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
  } catch (error) {
    console.error('❌ Server startup error:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
