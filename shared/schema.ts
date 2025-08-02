import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  avatarUrl: text("avatar_url"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login").defaultNow(),
});

export const botConfigs = pgTable("bot_configs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  guildId: text("guild_id").notNull(),
  guildName: text("guild_name").notNull(),
  botName: text("bot_name").default("Support Bot"),
  aiModel: text("ai_model").default("openai/gpt-4o"),
  systemPrompt: text("system_prompt"),
  policyContent: text("policy_content"),
  allowedChannels: jsonb("allowed_channels").$type<string[]>().default([]),
  allowedRoles: jsonb("allowed_roles").$type<string[]>().default([]),
  adminOnly: boolean("admin_only").default(false),
  isActive: boolean("is_active").default(false),
  faissIndexPath: text("faiss_index_path"),
  policyUpdatedAt: timestamp("policy_updated_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commandLogs = pgTable("command_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botConfigId: varchar("bot_config_id").notNull().references(() => botConfigs.id),
  commandName: text("command_name").notNull(),
  username: text("username").notNull(),
  channelName: text("channel_name").notNull(),
  success: boolean("success").notNull(),
  errorMessage: text("error_message"),
  responseTime: integer("response_time"),
  executedAt: timestamp("executed_at").defaultNow(),
});

export const userReviews = pgTable("user_reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botConfigId: varchar("bot_config_id").notNull().references(() => botConfigs.id),
  username: text("username").notNull(),
  rating: integer("rating").notNull(),
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const apiUsage = pgTable("api_usage", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  botConfigId: varchar("bot_config_id").notNull().references(() => botConfigs.id),
  provider: text("provider").notNull(),
  model: text("model").notNull(),
  tokensUsed: integer("tokens_used").notNull(),
  cost: integer("cost"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertBotConfigSchema = createInsertSchema(botConfigs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  policyUpdatedAt: true,
});

export const insertCommandLogSchema = createInsertSchema(commandLogs).omit({
  id: true,
  executedAt: true,
});

export const insertUserReviewSchema = createInsertSchema(userReviews).omit({
  id: true,
  createdAt: true,
});

export const insertApiUsageSchema = createInsertSchema(apiUsage).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type BotConfig = typeof botConfigs.$inferSelect;

export type InsertCommandLog = z.infer<typeof insertCommandLogSchema>;
export type CommandLog = typeof commandLogs.$inferSelect;

export type InsertUserReview = z.infer<typeof insertUserReviewSchema>;
export type UserReview = typeof userReviews.$inferSelect;

export type InsertApiUsage = z.infer<typeof insertApiUsageSchema>;
export type ApiUsage = typeof apiUsage.$inferSelect;
