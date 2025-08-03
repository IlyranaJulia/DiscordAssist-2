import Database from 'better-sqlite3';
import { 
  type User, 
  type InsertUser, 
  type BotConfig, 
  type InsertBotConfig,
  type CommandLog,
  type InsertCommandLog,
  type UserReview,
  type InsertUserReview,
  type ApiUsage,
  type InsertApiUsage
} from "@shared/schema";
import { randomUUID } from "crypto";

export class SQLiteStorage {
  private db: Database.Database;

  constructor() {
    this.db = new Database('discord_assist.db');
    this.initTables();
  }

  private initTables() {
    // Users table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        discord_id TEXT UNIQUE NOT NULL,
        username TEXT NOT NULL,
        avatar_url TEXT,
        email TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Bot configs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS bot_configs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        guild_id TEXT NOT NULL,
        guild_name TEXT NOT NULL,
        bot_name TEXT DEFAULT 'Support Bot',
        ai_model TEXT DEFAULT 'openai/gpt-4o',
        system_prompt TEXT,
        policy_content TEXT,
        allowed_channels TEXT,
        allowed_roles TEXT,
        admin_only BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT FALSE,
        faiss_index_path TEXT,
        policy_updated_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);

    // Command logs table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS command_logs (
        id TEXT PRIMARY KEY,
        bot_config_id TEXT NOT NULL,
        command_name TEXT NOT NULL,
        username TEXT NOT NULL,
        channel_name TEXT NOT NULL,
        success BOOLEAN NOT NULL,
        error_message TEXT,
        response_time INTEGER,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_config_id) REFERENCES bot_configs (id)
      )
    `);

    // User reviews table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_reviews (
        id TEXT PRIMARY KEY,
        bot_config_id TEXT NOT NULL,
        username TEXT NOT NULL,
        rating INTEGER NOT NULL,
        feedback TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_config_id) REFERENCES user_reviews (id)
      )
    `);

    // API usage table
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS api_usage (
        id TEXT PRIMARY KEY,
        bot_config_id TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        tokens_used INTEGER NOT NULL,
        cost INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (bot_config_id) REFERENCES api_usage (id)
      )
    `);
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?');
    const result = stmt.get(id) as any;
    return result ? this.mapUserFromDb(result) : undefined;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    const stmt = this.db.prepare('SELECT * FROM users WHERE discord_id = ?');
    const result = stmt.get(discordId) as any;
    return result ? this.mapUserFromDb(result) : undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO users (id, discord_id, username, avatar_url, email, created_at, last_login)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(id, insertUser.discordId, insertUser.username, insertUser.avatarUrl, insertUser.email);
    
    return {
      id,
      discordId: insertUser.discordId,
      username: insertUser.username,
      avatarUrl: insertUser.avatarUrl,
      email: insertUser.email,
      createdAt: new Date(),
      lastLogin: new Date()
    };
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.username !== undefined) {
      updateFields.push('username = ?');
      values.push(updates.username);
    }
    if (updates.avatarUrl !== undefined) {
      updateFields.push('avatar_url = ?');
      values.push(updates.avatarUrl);
    }
    if (updates.email !== undefined) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }
    if (updates.lastLogin !== undefined) {
      updateFields.push('last_login = ?');
      values.push(updates.lastLogin.toISOString());
    }

    if (updateFields.length === 0) return user;

    values.push(id);
    const stmt = this.db.prepare(`UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getUser(id);
  }

  // Bot Configurations
  async getBotConfig(id: string): Promise<BotConfig | undefined> {
    const stmt = this.db.prepare('SELECT * FROM bot_configs WHERE id = ?');
    const result = stmt.get(id) as any;
    return result ? this.mapBotConfigFromDb(result) : undefined;
  }

  async getBotConfigByGuildId(guildId: string, userId: string): Promise<BotConfig | undefined> {
    const stmt = this.db.prepare('SELECT * FROM bot_configs WHERE guild_id = ? AND user_id = ?');
    const result = stmt.get(guildId, userId) as any;
    return result ? this.mapBotConfigFromDb(result) : undefined;
  }

  async getBotConfigsByUserId(userId: string): Promise<BotConfig[]> {
    const stmt = this.db.prepare('SELECT * FROM bot_configs WHERE user_id = ? ORDER BY created_at DESC');
    const results = stmt.all(userId) as any[];
    return results.map(this.mapBotConfigFromDb);
  }

  async createBotConfig(insertConfig: InsertBotConfig): Promise<BotConfig> {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO bot_configs (
        id, user_id, guild_id, guild_name, bot_name, ai_model, system_prompt,
        policy_content, allowed_channels, allowed_roles, admin_only, is_active,
        faiss_index_path, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      id,
      insertConfig.userId,
      insertConfig.guildId,
      insertConfig.guildName,
      insertConfig.botName || null,
      insertConfig.aiModel || null,
      insertConfig.systemPrompt || null,
      insertConfig.policyContent || null,
      JSON.stringify(insertConfig.allowedChannels || []),
      JSON.stringify(insertConfig.allowedRoles || []),
      insertConfig.adminOnly || false,
      insertConfig.isActive || false,
      insertConfig.faissIndexPath || null
    );
    
    return this.getBotConfig(id)!;
  }

  async updateBotConfig(id: string, updates: Partial<BotConfig>): Promise<BotConfig | undefined> {
    const config = await this.getBotConfig(id);
    if (!config) return undefined;

    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.botName !== undefined) {
      updateFields.push('bot_name = ?');
      values.push(updates.botName);
    }
    if (updates.aiModel !== undefined) {
      updateFields.push('ai_model = ?');
      values.push(updates.aiModel);
    }
    if (updates.systemPrompt !== undefined) {
      updateFields.push('system_prompt = ?');
      values.push(updates.systemPrompt);
    }
    if (updates.policyContent !== undefined) {
      updateFields.push('policy_content = ?');
      values.push(updates.policyContent);
    }
    if (updates.allowedChannels !== undefined) {
      updateFields.push('allowed_channels = ?');
      values.push(JSON.stringify(updates.allowedChannels));
    }
    if (updates.allowedRoles !== undefined) {
      updateFields.push('allowed_roles = ?');
      values.push(JSON.stringify(updates.allowedRoles));
    }
    if (updates.adminOnly !== undefined) {
      updateFields.push('admin_only = ?');
      values.push(updates.adminOnly);
    }
    if (updates.isActive !== undefined) {
      updateFields.push('is_active = ?');
      values.push(updates.isActive);
    }
    if (updates.faissIndexPath !== undefined) {
      updateFields.push('faiss_index_path = ?');
      values.push(updates.faissIndexPath);
    }
    if (updates.policyUpdatedAt !== undefined) {
      updateFields.push('policy_updated_at = ?');
      values.push(updates.policyUpdatedAt.toISOString());
    }

    if (updateFields.length === 0) return config;

    updateFields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);
    
    const stmt = this.db.prepare(`UPDATE bot_configs SET ${updateFields.join(', ')} WHERE id = ?`);
    stmt.run(...values);

    return this.getBotConfig(id);
  }

  async deleteBotConfig(id: string): Promise<boolean> {
    const stmt = this.db.prepare('DELETE FROM bot_configs WHERE id = ?');
    const result = stmt.run(id);
    return result.changes > 0;
  }

  // Command Logs
  async getCommandLogsByBotConfigId(botConfigId: string, limit = 50): Promise<CommandLog[]> {
    const stmt = this.db.prepare('SELECT * FROM command_logs WHERE bot_config_id = ? ORDER BY executed_at DESC LIMIT ?');
    const results = stmt.all(botConfigId, limit) as any[];
    return results.map(this.mapCommandLogFromDb);
  }

  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO command_logs (id, bot_config_id, command_name, username, channel_name, success, error_message, response_time, executed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      id,
      insertLog.botConfigId,
      insertLog.commandName,
      insertLog.username,
      insertLog.channelName,
      insertLog.success,
      insertLog.errorMessage,
      insertLog.responseTime
    );
    
    return {
      id,
      botConfigId: insertLog.botConfigId,
      commandName: insertLog.commandName,
      username: insertLog.username,
      channelName: insertLog.channelName,
      success: insertLog.success,
      errorMessage: insertLog.errorMessage,
      responseTime: insertLog.responseTime,
      executedAt: new Date()
    };
  }

  // User Reviews
  async getUserReviewsByBotConfigId(botConfigId: string, limit = 20): Promise<UserReview[]> {
    const stmt = this.db.prepare('SELECT * FROM user_reviews WHERE bot_config_id = ? ORDER BY created_at DESC LIMIT ?');
    const results = stmt.all(botConfigId, limit) as any[];
    return results.map(this.mapUserReviewFromDb);
  }

  async createUserReview(insertReview: InsertUserReview): Promise<UserReview> {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO user_reviews (id, bot_config_id, username, rating, feedback, created_at)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      id,
      insertReview.botConfigId,
      insertReview.username,
      insertReview.rating,
      insertReview.feedback
    );
    
    return {
      id,
      botConfigId: insertReview.botConfigId,
      username: insertReview.username,
      rating: insertReview.rating,
      feedback: insertReview.feedback,
      createdAt: new Date()
    };
  }

  // API Usage
  async getApiUsageByBotConfigId(botConfigId: string, limit = 100): Promise<ApiUsage[]> {
    const stmt = this.db.prepare('SELECT * FROM api_usage WHERE bot_config_id = ? ORDER BY created_at DESC LIMIT ?');
    const results = stmt.all(botConfigId, limit) as any[];
    return results.map(this.mapApiUsageFromDb);
  }

  async createApiUsage(insertUsage: InsertApiUsage): Promise<ApiUsage> {
    const id = randomUUID();
    const stmt = this.db.prepare(`
      INSERT INTO api_usage (id, bot_config_id, provider, model, tokens_used, cost, created_at)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);
    
    stmt.run(
      id,
      insertUsage.botConfigId,
      insertUsage.provider,
      insertUsage.model,
      insertUsage.tokensUsed,
      insertUsage.cost
    );
    
    return {
      id,
      botConfigId: insertUsage.botConfigId,
      provider: insertUsage.provider,
      model: insertUsage.model,
      tokensUsed: insertUsage.tokensUsed,
      cost: insertUsage.cost,
      createdAt: new Date()
    };
  }

  // Statistics
  async getBotConfigStats(botConfigId: string): Promise<{
    totalCommands: number;
    successfulCommands: number;
    avgRating: number;
    avgResponseTime: number;
  }> {
    const commandStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_commands,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_commands,
        AVG(response_time) as avg_response_time
      FROM command_logs 
      WHERE bot_config_id = ?
    `).get(botConfigId) as any;

    const ratingStats = this.db.prepare(`
      SELECT AVG(rating) as avg_rating
      FROM user_reviews 
      WHERE bot_config_id = ?
    `).get(botConfigId) as any;

    return {
      totalCommands: commandStats.total_commands || 0,
      successfulCommands: commandStats.successful_commands || 0,
      avgRating: ratingStats.avg_rating || 0,
      avgResponseTime: commandStats.avg_response_time || 0
    };
  }

  async getDashboardStats(userId: string): Promise<{
    totalBots: number;
    activeBots: number;
    totalCommands: number;
    successRate: number;
  }> {
    const botStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_bots,
        SUM(CASE WHEN is_active = 1 THEN 1 ELSE 0 END) as active_bots
      FROM bot_configs 
      WHERE user_id = ?
    `).get(userId) as any;

    const commandStats = this.db.prepare(`
      SELECT 
        COUNT(*) as total_commands,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful_commands
      FROM command_logs cl
      JOIN bot_configs bc ON cl.bot_config_id = bc.id
      WHERE bc.user_id = ?
    `).get(userId) as any;

    const totalCommands = commandStats.total_commands || 0;
    const successfulCommands = commandStats.successful_commands || 0;
    const successRate = totalCommands > 0 ? (successfulCommands / totalCommands) * 100 : 0;

    return {
      totalBots: botStats.total_bots || 0,
      activeBots: botStats.active_bots || 0,
      totalCommands,
      successRate
    };
  }

  // Helper methods for mapping database results
  private mapUserFromDb(row: any): User {
    return {
      id: row.id,
      discordId: row.discord_id,
      username: row.username,
      avatarUrl: row.avatar_url,
      email: row.email,
      createdAt: new Date(row.created_at),
      lastLogin: new Date(row.last_login)
    };
  }

  private mapBotConfigFromDb(row: any): BotConfig {
    return {
      id: row.id,
      userId: row.user_id,
      guildId: row.guild_id,
      guildName: row.guild_name,
      botName: row.bot_name,
      aiModel: row.ai_model,
      systemPrompt: row.system_prompt,
      policyContent: row.policy_content,
      allowedChannels: row.allowed_channels ? JSON.parse(row.allowed_channels) : [],
      allowedRoles: row.allowed_roles ? JSON.parse(row.allowed_roles) : [],
      adminOnly: Boolean(row.admin_only),
      isActive: Boolean(row.is_active),
      faissIndexPath: row.faiss_index_path,
      policyUpdatedAt: row.policy_updated_at ? new Date(row.policy_updated_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    };
  }

  private mapCommandLogFromDb(row: any): CommandLog {
    return {
      id: row.id,
      botConfigId: row.bot_config_id,
      commandName: row.command_name,
      username: row.username,
      channelName: row.channel_name,
      success: Boolean(row.success),
      errorMessage: row.error_message,
      responseTime: row.response_time,
      executedAt: new Date(row.executed_at)
    };
  }

  private mapUserReviewFromDb(row: any): UserReview {
    return {
      id: row.id,
      botConfigId: row.bot_config_id,
      username: row.username,
      rating: row.rating,
      feedback: row.feedback,
      createdAt: new Date(row.created_at)
    };
  }

  private mapApiUsageFromDb(row: any): ApiUsage {
    return {
      id: row.id,
      botConfigId: row.bot_config_id,
      provider: row.provider,
      model: row.model,
      tokensUsed: row.tokens_used,
      cost: row.cost,
      createdAt: new Date(row.created_at)
    };
  }
} 