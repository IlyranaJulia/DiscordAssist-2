import type { Express } from "express";
import { createServer, type Server } from "http";
import { createStorage } from "./config";
import { insertBotConfigSchema, insertCommandLogSchema, insertUserReviewSchema } from "@shared/schema";
import { z } from "zod";

// Extend the session interface to include userId
declare module 'express-session' {
  interface SessionData {
    userId?: string;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  const storage = createStorage();
  
  // Discord OAuth routes
  app.get("/api/auth/discord", (req, res) => {
    const discordClientId = process.env.DISCORD_CLIENT_ID;
    const host = req.get('host');
    let redirectUri = process.env.DISCORD_REDIRECT_URI;
    
    if (!redirectUri) {
      // Use exact localhost format that matches Discord settings
      redirectUri = 'http://localhost:5000/api/auth/discord/callback';
    }
    
    if (!discordClientId) {
      return res.status(500).json({ error: "Discord client ID not configured" });
    }

    const discordAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=identify%20email%20guilds`;
    
    res.json({ authUrl: discordAuthUrl });
  });

  // Temporary bypass for testing (remove this in production)
  app.get("/api/auth/test", async (req, res) => {
    try {
      // Check if test user already exists
      let testUser = await storage.getUserByDiscordId("test_user_123");
      
      if (!testUser) {
        // Create a test user if it doesn't exist
        testUser = await storage.createUser({
          discordId: "test_user_123",
          username: "TestUser",
          avatarUrl: null,
          email: "test@example.com",
        });
      } else {
        // Update last login for existing user
        testUser = await storage.updateUser(testUser.id, {
          lastLogin: new Date(),
        });
      }

      // Store user session
      if (testUser) {
        req.session.userId = testUser.id;
      }

      res.json({ 
        success: true, 
        user: testUser,
        message: "Test authentication successful - you can now test the dashboard"
      });
    } catch (error) {
      console.error("Test auth error:", error);
      res.status(500).json({ error: "Test authentication failed" });
    }
  });

  // Manual Discord account testing (for when OAuth is blocked)
  app.get("/manual-auth", (req, res) => {
    res.sendFile('manual-auth.html', { root: './client/public' });
  });

  app.post("/api/auth/manual", async (req, res) => {
    try {
      const { discordId, username, email } = req.body;
      
      if (!discordId || !username) {
        return res.status(400).json({ 
          error: "Discord ID and username are required" 
        });
      }

      // Check if user already exists
      let user = await storage.getUserByDiscordId(discordId);
      
      if (!user) {
        // Create new user
        user = await storage.createUser({
          discordId,
          username,
          avatarUrl: null,
          email: email || null,
        });
      } else {
        // Update existing user
        user = await storage.updateUser(user.id, {
          username,
          email: email || user.email,
          lastLogin: new Date(),
        });
      }

      // Store user session
      if (user) {
        req.session.userId = user.id;
      }

      res.json({ 
        success: true, 
        user,
        message: "Manual authentication successful"
      });
    } catch (error) {
      console.error("Manual auth error:", error);
      res.status(500).json({ error: "Manual authentication failed" });
    }
  });

  // Bot management endpoints - Only bot owner can control the bot
  app.post("/api/bot-configs/:id/start", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user is the bot owner (you)
    const isBotOwner = userId === "f090054c-d236-4dcd-8d06-b2b694024382"; // Your user ID
    if (!isBotOwner) {
      return res.status(403).json({ error: "Only the bot owner can start/stop the bot" });
    }

    try {
      const { id } = req.params;
      const { botManager } = await import('./discord-bot');
      
      const success = await botManager.startBot(id);
      
      if (success) {
        // Register slash commands
        await botManager.registerCommands(id);
        res.json({ success: true, message: "Bot started successfully" });
      } else {
        res.status(500).json({ error: "Failed to start bot" });
      }
    } catch (error) {
      console.error("Error starting bot:", error);
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  app.post("/api/bot-configs/:id/stop", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user is the bot owner (you)
    const isBotOwner = userId === "f090054c-d236-4dcd-8d06-b2b694024382"; // Your user ID
    if (!isBotOwner) {
      return res.status(403).json({ error: "Only the bot owner can start/stop the bot" });
    }

    try {
      const { id } = req.params;
      const { botManager } = await import('./discord-bot');
      
      const success = await botManager.stopBot(id);
      
      if (success) {
        res.json({ success: true, message: "Bot stopped successfully" });
      } else {
        res.status(500).json({ error: "Failed to stop bot" });
      }
    } catch (error) {
      console.error("Error stopping bot:", error);
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  app.get("/api/bot-configs/:id/status", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Check if user is the bot owner (you)
    const isBotOwner = userId === "f090054c-d236-4dcd-8d06-b2b694024382"; // Your user ID
    if (!isBotOwner) {
      return res.status(403).json({ error: "Only the bot owner can check bot status" });
    }

    try {
      const { id } = req.params;
      const { botManager } = await import('./discord-bot');
      
      const isActive = botManager.isBotActive(id);
      res.json({ isActive });
    } catch (error) {
      console.error("Error getting bot status:", error);
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // Discord OAuth callback (GET for browser redirect)
  app.get("/api/auth/discord/callback", async (req, res) => {
    try {
      const { code, error } = req.query;
      
      if (error) {
        return res.send(`
          <script>
            window.opener?.postMessage({ type: 'DISCORD_AUTH_ERROR', error: '${error}' }, '*');
            window.close();
          </script>
        `);
      }
      
      if (!code) {
        return res.send(`
          <script>
            window.opener?.postMessage({ type: 'DISCORD_AUTH_ERROR', error: 'Authorization code required' }, '*');
            window.close();
          </script>
        `);
      }

      const discordClientId = process.env.DISCORD_CLIENT_ID;
      const discordClientSecret = process.env.DISCORD_CLIENT_SECRET;
      const host = req.get('host');
      let redirectUri = process.env.DISCORD_REDIRECT_URI;
      
      if (!redirectUri) {
        // Use exact localhost format that matches Discord settings
        redirectUri = 'http://localhost:5000/api/auth/discord/callback';
      }

      if (!discordClientId || !discordClientSecret) {
        return res.status(500).json({ error: "Discord OAuth not configured" });
      }

      // Exchange code for access token
      const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: discordClientId,
          client_secret: discordClientSecret,
          grant_type: 'authorization_code',
          code: code as string,
          redirect_uri: redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error("Discord token exchange failed:", errorText);
        return res.send(`
          <script>
            window.opener?.postMessage({ type: 'DISCORD_AUTH_ERROR', error: 'Discord authentication expired. Please try again.' }, '*');
            window.close();
          </script>
        `);
      }

      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;

      // Get user info
      const userResponse = await fetch('https://discord.com/api/users/@me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!userResponse.ok) {
        console.error("Discord user fetch failed:", await userResponse.text());
        return res.send(`
          <script>
            window.opener?.postMessage({ type: 'DISCORD_AUTH_ERROR', error: 'Failed to get user information from Discord' }, '*');
            window.close();
          </script>
        `);
      }

      const userData = await userResponse.json();

      // Create or update user
      let user = await storage.getUserByDiscordId(userData.id);
      if (!user) {
        user = await storage.createUser({
          discordId: userData.id,
          username: userData.username,
          avatarUrl: userData.avatar ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png` : null,
          email: userData.email,
        });
      } else {
        user = await storage.updateUser(user.id, {
          username: userData.username,
          lastLogin: new Date(),
        });
      }

      // Store user session
      req.session.userId = user?.id;

      // Send success message to popup parent window  
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Success</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 2rem;">
          <h2 style="color: #10b981;">✅ Authentication Successful!</h2>
          <p>You can close this window.</p>
          <script>
            try {
              if (window.opener) {
                // For popup windows (non-Safari browsers)
                window.opener.postMessage({ 
                  type: 'DISCORD_AUTH_SUCCESS', 
                  user: ${JSON.stringify(user)} 
                }, '*');
                setTimeout(() => window.close(), 1000);
              } else {
                // For Safari direct navigation
                console.log('Safari auth callback - redirecting to dashboard');
                window.location.href = '/dashboard';
              }
            } catch (error) {
              console.error('Auth callback error:', error);
              window.location.href = '/dashboard';
            }
          </script>
        </body>
        </html>
      `);
    } catch (error) {
      console.error("Discord auth error:", error);
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Authentication Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-align: center; padding: 2rem;">
          <h2 style="color: #ef4444;">❌ Authentication Failed</h2>
          <p>Please try again. You can close this window.</p>
          <script>
            try {
              if (window.opener) {
                // For popup windows (non-Safari browsers)
                window.opener.postMessage({ type: 'DISCORD_AUTH_ERROR', error: 'Authentication failed' }, '*');
                setTimeout(() => window.close(), 2000);
              } else {
                // For Safari direct navigation
                console.log('Safari auth error - redirecting to home');
                window.location.href = '/';
              }
            } catch (error) {
              console.error('Auth error callback:', error);
              window.location.href = '/';
            }
          </script>
        </body>
        </html>
      `);
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Could not log out" });
      }
      res.json({ success: true });
    });
  });

  // User routes
  app.get("/api/user/me", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  // Bot configuration routes - Users can only configure policies for existing bots
  app.get("/api/bot-configs", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // For now, return a single bot config that represents the main bot
    // In the future, this could be expanded to support multiple bots
    const mainBotConfig = {
      id: "main-bot",
      userId: userId,
      guildId: "all-servers", // Represents all servers where the bot is invited
      guildName: "All Servers",
      botName: "DiscordAssist Bot",
      aiModel: "openai/gpt-4o",
      systemPrompt: "You are a helpful Discord assistant.",
      policyContent: "Default policy content",
      allowedChannels: [],
      allowedRoles: [],
      adminOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json([mainBotConfig]);
  });

  app.get("/api/bot-configs/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Return the main bot config for any ID (since there's only one bot)
    const mainBotConfig = {
      id: req.params.id,
      userId: userId,
      guildId: "all-servers",
      guildName: "All Servers",
      botName: "DiscordAssist Bot",
      aiModel: "openai/gpt-4o",
      systemPrompt: "You are a helpful Discord assistant.",
      policyContent: "Default policy content",
      allowedChannels: [],
      allowedRoles: [],
      adminOnly: false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json(mainBotConfig);
  });

  // Users can only update policy content, not create new bots
  app.patch("/api/bot-configs/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // Only allow updating specific fields that users should be able to modify
    const allowedUpdates = {
      policyContent: req.body.policyContent,
      systemPrompt: req.body.systemPrompt,
      aiModel: req.body.aiModel,
      allowedChannels: req.body.allowedChannels,
      allowedRoles: req.body.allowedRoles,
      adminOnly: req.body.adminOnly
    };

    // Filter out undefined values
    const filteredUpdates = Object.fromEntries(
      Object.entries(allowedUpdates).filter(([_, value]) => value !== undefined)
    );

    // Update the bot config (in a real implementation, this would save to database)
    const updatedConfig = {
      id: req.params.id,
      userId: userId,
      guildId: "all-servers",
      guildName: "All Servers",
      botName: "DiscordAssist Bot",
      aiModel: filteredUpdates.aiModel || "openai/gpt-4o",
      systemPrompt: filteredUpdates.systemPrompt || "You are a helpful Discord assistant.",
      policyContent: filteredUpdates.policyContent || "Default policy content",
      allowedChannels: filteredUpdates.allowedChannels || [],
      allowedRoles: filteredUpdates.allowedRoles || [],
      adminOnly: filteredUpdates.adminOnly || false,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json(updatedConfig);
  });

  // Bot invite link - Users can get the invite link for the bot
  app.get("/api/bot/invite", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const discordClientId = process.env.DISCORD_CLIENT_ID;
    if (!discordClientId) {
      return res.status(500).json({ error: "Bot not configured" });
    }

    // Generate invite link with appropriate permissions
    const permissions = [
      "SendMessages",
      "ReadMessageHistory", 
      "UseSlashCommands",
      "EmbedLinks",
      "AttachFiles"
    ].join('%20');

    const inviteUrl = `https://discord.com/api/oauth2/authorize?client_id=${discordClientId}&permissions=${permissions}&scope=bot%20applications.commands`;

    res.json({ 
      inviteUrl,
      message: "Use this link to invite the DiscordAssist bot to your server"
    });
  });

  // Remove the POST endpoint for creating new bots since users can't create bots
  // app.post("/api/bot-configs", ...) - REMOVED

  app.delete("/api/bot-configs/:id", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    const deleted = await storage.deleteBotConfig(req.params.id);
    if (deleted) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: "Failed to delete bot configuration" });
    }
  });

  // Statistics routes
  app.get("/api/dashboard/stats", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const stats = await storage.getDashboardStats(userId);
    res.json(stats);
  });

  app.get("/api/bot-configs/:id/stats", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    const stats = await storage.getBotConfigStats(req.params.id);
    res.json(stats);
  });

  // Command logs routes
  app.get("/api/bot-configs/:id/logs", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const logs = await storage.getCommandLogsByBotConfigId(req.params.id, limit);
    res.json(logs);
  });

  app.post("/api/bot-configs/:id/logs", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    try {
      const validatedData = insertCommandLogSchema.parse({ ...req.body, botConfigId: req.params.id });
      const log = await storage.createCommandLog(validatedData);
      res.status(201).json(log);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create command log" });
    }
  });

  // User reviews routes
  app.get("/api/bot-configs/:id/reviews", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const reviews = await storage.getUserReviewsByBotConfigId(req.params.id, limit);
    res.json(reviews);
  });

  app.post("/api/bot-configs/:id/reviews", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const config = await storage.getBotConfig(req.params.id);
    if (!config || config.userId !== userId) {
      return res.status(404).json({ error: "Bot configuration not found" });
    }

    try {
      const validatedData = insertUserReviewSchema.parse({ ...req.body, botConfigId: req.params.id });
      const review = await storage.createUserReview(validatedData);
      res.status(201).json(review);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create user review" });
    }
  });

  // Recent activity route
  app.get("/api/recent-activity", async (req, res) => {
    const userId = req.session?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const configs = await storage.getBotConfigsByUserId(userId);
    const configIds = configs.map(config => config.id);
    
    // Get recent logs across all user's bots
    const allLogs = await Promise.all(
      configIds.map(id => storage.getCommandLogsByBotConfigId(id, 10))
    );
    
    const recentLogs = allLogs.flat()
      .sort((a, b) => (b.executedAt ? new Date(b.executedAt).getTime() : 0) - (a.executedAt ? new Date(a.executedAt).getTime() : 0))
      .slice(0, 10);

    res.json(recentLogs);
  });

  const httpServer = createServer(app);
  return httpServer;
}
