import { MemStorage } from "./storage";
import { SQLiteStorage } from "./sqlite-storage";

export interface Config {
  port: number;
  sessionSecret: string;
  discordClientId: string;
  discordClientSecret: string;
  discordRedirectUri: string;
  databaseUrl?: string;
  storageType: 'memory' | 'sqlite' | 'postgresql';
  openaiApiKey?: string;
  openrouterApiKey?: string;
}

export function getConfig(): Config {
  const port = parseInt(process.env.PORT || '5000', 10);
  const sessionSecret = process.env.SESSION_SECRET || 'fallback-secret-change-in-production';
  const discordClientId = process.env.DISCORD_CLIENT_ID || '';
  const discordClientSecret = process.env.DISCORD_CLIENT_SECRET || '';
  const discordRedirectUri = process.env.DISCORD_REDIRECT_URI || 'http://localhost:5000/api/auth/discord/callback';
  const databaseUrl = process.env.DATABASE_URL;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const openrouterApiKey = process.env.OPENROUTER_API_KEY;

  // Determine storage type based on environment
  let storageType: 'memory' | 'sqlite' | 'postgresql' = 'sqlite'; // Default to SQLite for persistence
  
  if (databaseUrl) {
    if (databaseUrl.includes('postgresql://') || databaseUrl.includes('postgres://')) {
      storageType = 'postgresql';
    } else if (databaseUrl.includes('sqlite://') || databaseUrl.includes('.db')) {
      storageType = 'sqlite';
    }
  } else {
    // If no DATABASE_URL, default to SQLite for persistence
    storageType = 'sqlite';
  }

  return {
    port,
    sessionSecret,
    discordClientId,
    discordClientSecret,
    discordRedirectUri,
    databaseUrl,
    storageType,
    openaiApiKey,
    openrouterApiKey
  };
}

export function createStorage() {
  const config = getConfig();
  
  switch (config.storageType) {
    case 'sqlite':
      return new SQLiteStorage();
    case 'postgresql':
      // For PostgreSQL, you'd need to implement a PostgreSQL storage class
      // For now, fall back to memory storage
      console.warn('PostgreSQL storage not implemented yet, falling back to memory storage');
      return new MemStorage();
    case 'memory':
    default:
      return new MemStorage();
  }
}

export function validateConfig(): string[] {
  const config = getConfig();
  const errors: string[] = [];

  // Only require Discord credentials in production
  if (process.env.NODE_ENV === 'production') {
    if (!config.discordClientId) {
      errors.push('DISCORD_CLIENT_ID is required');
    }

    if (!config.discordClientSecret) {
      errors.push('DISCORD_CLIENT_SECRET is required');
    }
  }

  if (config.sessionSecret === 'fallback-secret-change-in-production') {
    console.warn('⚠️  Using fallback session secret. Set SESSION_SECRET in production.');
  }

  return errors;
} 