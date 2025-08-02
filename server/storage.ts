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

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Bot Configurations
  getBotConfig(id: string): Promise<BotConfig | undefined>;
  getBotConfigByGuildId(guildId: string, userId: string): Promise<BotConfig | undefined>;
  getBotConfigsByUserId(userId: string): Promise<BotConfig[]>;
  createBotConfig(config: InsertBotConfig): Promise<BotConfig>;
  updateBotConfig(id: string, updates: Partial<BotConfig>): Promise<BotConfig | undefined>;
  deleteBotConfig(id: string): Promise<boolean>;

  // Command Logs
  getCommandLogsByBotConfigId(botConfigId: string, limit?: number): Promise<CommandLog[]>;
  createCommandLog(log: InsertCommandLog): Promise<CommandLog>;

  // User Reviews
  getUserReviewsByBotConfigId(botConfigId: string, limit?: number): Promise<UserReview[]>;
  createUserReview(review: InsertUserReview): Promise<UserReview>;

  // API Usage
  getApiUsageByBotConfigId(botConfigId: string, limit?: number): Promise<ApiUsage[]>;
  createApiUsage(usage: InsertApiUsage): Promise<ApiUsage>;

  // Statistics
  getBotConfigStats(botConfigId: string): Promise<{
    totalCommands: number;
    successfulCommands: number;
    avgRating: number;
    avgResponseTime: number;
  }>;

  getDashboardStats(userId: string): Promise<{
    totalBots: number;
    activeBots: number;
    totalCommands: number;
    successRate: number;
  }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private botConfigs: Map<string, BotConfig> = new Map();
  private commandLogs: Map<string, CommandLog> = new Map();
  private userReviews: Map<string, UserReview> = new Map();
  private apiUsage: Map<string, ApiUsage> = new Map();

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.discordId === discordId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser,
      email: insertUser.email ?? null,
      avatarUrl: insertUser.avatarUrl ?? null,
      id,
      createdAt: new Date(),
      lastLogin: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getBotConfig(id: string): Promise<BotConfig | undefined> {
    return this.botConfigs.get(id);
  }

  async getBotConfigByGuildId(guildId: string, userId: string): Promise<BotConfig | undefined> {
    return Array.from(this.botConfigs.values()).find(
      config => config.guildId === guildId && config.userId === userId
    );
  }

  async getBotConfigsByUserId(userId: string): Promise<BotConfig[]> {
    return Array.from(this.botConfigs.values()).filter(config => config.userId === userId);
  }

  async createBotConfig(insertConfig: InsertBotConfig): Promise<BotConfig> {
    const id = randomUUID();
    const config: BotConfig = {
      ...insertConfig,
      botName: insertConfig.botName ?? null,
      aiModel: insertConfig.aiModel ?? null,
      systemPrompt: insertConfig.systemPrompt ?? null,
      policyContent: insertConfig.policyContent ?? null,
      faissIndexPath: insertConfig.faissIndexPath ?? null,
      allowedChannels: insertConfig.allowedChannels ? [...insertConfig.allowedChannels] : null,
      allowedRoles: insertConfig.allowedRoles ? [...insertConfig.allowedRoles] : null,
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
      policyUpdatedAt: null,
    };
    this.botConfigs.set(id, config);
    return config;
  }

  async updateBotConfig(id: string, updates: Partial<BotConfig>): Promise<BotConfig | undefined> {
    const config = this.botConfigs.get(id);
    if (!config) return undefined;

    const updatedConfig = { 
      ...config, 
      ...updates, 
      updatedAt: new Date(),
      ...(updates.policyContent ? { policyUpdatedAt: new Date() } : {})
    };
    this.botConfigs.set(id, updatedConfig);
    return updatedConfig;
  }

  async deleteBotConfig(id: string): Promise<boolean> {
    return this.botConfigs.delete(id);
  }

  async getCommandLogsByBotConfigId(botConfigId: string, limit = 50): Promise<CommandLog[]> {
    return Array.from(this.commandLogs.values())
      .filter(log => log.botConfigId === botConfigId)
      .sort((a, b) => (b.executedAt ? new Date(b.executedAt).getTime() : 0) - (a.executedAt ? new Date(a.executedAt).getTime() : 0))
      .slice(0, limit);
  }

  async createCommandLog(insertLog: InsertCommandLog): Promise<CommandLog> {
    const id = randomUUID();
    const log: CommandLog = {
      ...insertLog,
      errorMessage: insertLog.errorMessage ?? null,
      responseTime: insertLog.responseTime ?? null,
      id,
      executedAt: new Date(),
    };
    this.commandLogs.set(id, log);
    return log;
  }

  async getUserReviewsByBotConfigId(botConfigId: string, limit = 20): Promise<UserReview[]> {
    return Array.from(this.userReviews.values())
      .filter(review => review.botConfigId === botConfigId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0))
      .slice(0, limit);
  }

  async createUserReview(insertReview: InsertUserReview): Promise<UserReview> {
    const id = randomUUID();
    const review: UserReview = {
      ...insertReview,
      feedback: insertReview.feedback ?? null,
      id,
      createdAt: new Date(),
    };
    this.userReviews.set(id, review);
    return review;
  }

  async getApiUsageByBotConfigId(botConfigId: string, limit = 100): Promise<ApiUsage[]> {
    return Array.from(this.apiUsage.values())
      .filter(usage => usage.botConfigId === botConfigId)
      .sort((a, b) => (b.createdAt ? new Date(b.createdAt).getTime() : 0) - (a.createdAt ? new Date(a.createdAt).getTime() : 0))
      .slice(0, limit);
  }

  async createApiUsage(insertUsage: InsertApiUsage): Promise<ApiUsage> {
    const id = randomUUID();
    const usage: ApiUsage = {
      ...insertUsage,
      cost: insertUsage.cost ?? null,
      id,
      createdAt: new Date(),
    };
    this.apiUsage.set(id, usage);
    return usage;
  }

  async getBotConfigStats(botConfigId: string): Promise<{
    totalCommands: number;
    successfulCommands: number;
    avgRating: number;
    avgResponseTime: number;
  }> {
    const logs = Array.from(this.commandLogs.values()).filter(log => log.botConfigId === botConfigId);
    const reviews = Array.from(this.userReviews.values()).filter(review => review.botConfigId === botConfigId);

    const totalCommands = logs.length;
    const successfulCommands = logs.filter(log => log.success).length;
    const avgRating = reviews.length > 0 
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length 
      : 0;
    const avgResponseTime = logs.length > 0
      ? logs.filter(log => log.responseTime).reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.filter(log => log.responseTime).length
      : 0;

    return {
      totalCommands,
      successfulCommands,
      avgRating,
      avgResponseTime,
    };
  }

  async getDashboardStats(userId: string): Promise<{
    totalBots: number;
    activeBots: number;
    totalCommands: number;
    successRate: number;
  }> {
    const userBots = Array.from(this.botConfigs.values()).filter(config => config.userId === userId);
    const userBotIds = userBots.map(bot => bot.id);
    const userLogs = Array.from(this.commandLogs.values()).filter(log => userBotIds.includes(log.botConfigId));

    const totalBots = userBots.length;
    const activeBots = userBots.filter(bot => bot.isActive).length;
    const totalCommands = userLogs.length;
    const successfulCommands = userLogs.filter(log => log.success).length;
    const successRate = totalCommands > 0 ? Math.round((successfulCommands / totalCommands) * 100) : 0;

    return {
      totalBots,
      activeBots,
      totalCommands,
      successRate,
    };
  }
}

export const storage = new MemStorage();
