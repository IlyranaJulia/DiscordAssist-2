import { Client, GatewayIntentBits, Events, Interaction, ChatInputCommandInteraction } from 'discord.js';
import { createStorage } from './config';

interface BotInstance {
  client: Client;
  configId: string;
  guildId: string;
}

class DiscordBotManager {
  private bots: Map<string, BotInstance> = new Map();
  private storage = createStorage();

  async startBot(configId: string): Promise<boolean> {
    try {
      // Get bot configuration
      const config = await this.storage.getBotConfig(configId);
      if (!config) {
        console.error(`Bot config not found: ${configId}`);
        return false;
      }

      // Check if bot is already running
      if (this.bots.has(configId)) {
        console.log(`Bot already running for config: ${configId}`);
        return true;
      }

      // Create Discord client
      const client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.MessageContent,
        ],
      });

      // Set up event handlers
      client.on(Events.ClientReady, () => {
        console.log(`🤖 Bot ${config.botName} is ready for guild: ${config.guildName}`);
      });

      client.on(Events.InteractionCreate, async (interaction: Interaction) => {
        if (interaction.isChatInputCommand()) {
          await this.handleSlashCommand(interaction, config);
        }
      });

      // Login with bot token
      const botToken = process.env.DISCORD_BOT_TOKEN;
      if (!botToken) {
        console.error('DISCORD_BOT_TOKEN not configured');
        return false;
      }

      await client.login(botToken);

      // Store bot instance
      this.bots.set(configId, {
        client,
        configId,
        guildId: config.guildId,
      });

      // Update config as active
      await this.storage.updateBotConfig(configId, {
        isActive: true,
      });

      console.log(`✅ Bot ${config.botName} started successfully`);
      return true;
    } catch (error) {
      console.error(`Failed to start bot for config ${configId}:`, error);
      return false;
    }
  }

  async stopBot(configId: string): Promise<boolean> {
    try {
      const bot = this.bots.get(configId);
      if (!bot) {
        console.log(`Bot not running for config: ${configId}`);
        return true;
      }

      // Destroy the client
      await bot.client.destroy();
      this.bots.delete(configId);

      // Update config as inactive
      await this.storage.updateBotConfig(configId, {
        isActive: false,
      });

      console.log(`🛑 Bot stopped for config: ${configId}`);
      return true;
    } catch (error) {
      console.error(`Failed to stop bot for config ${configId}:`, error);
      return false;
    }
  }

  async handleSlashCommand(interaction: ChatInputCommandInteraction, config: any) {
    try {
      // Check if command is allowed in this channel
      if (config.allowedChannels && config.allowedChannels.length > 0) {
        if (!config.allowedChannels.includes(interaction.channelId)) {
          await interaction.reply({
            content: '❌ This command is not allowed in this channel.',
            ephemeral: true,
          });
          return;
        }
      }

      // Check if user has required permissions
      if (config.adminOnly) {
        const member = interaction.member;
        if (!member || !member.permissions.has('Administrator')) {
          await interaction.reply({
            content: '❌ This command requires administrator permissions.',
            ephemeral: true,
          });
          return;
        }
      }

      const commandName = interaction.commandName;
      
      // Log the command
      await this.storage.createCommandLog({
        botConfigId: config.id,
        commandName,
        username: interaction.user.username,
        channelName: interaction.channel?.name || 'unknown',
        success: true,
        responseTime: 0,
      });

      // Handle different commands
      switch (commandName) {
        case 'help':
          await this.handleHelpCommand(interaction, config);
          break;
        case 'support':
          await this.handleSupportCommand(interaction, config);
          break;
        default:
          await interaction.reply({
            content: '❓ Unknown command. Use `/help` for available commands.',
            ephemeral: true,
          });
      }
    } catch (error) {
      console.error('Error handling slash command:', error);
      
      // Log the error
      await this.storage.createCommandLog({
        botConfigId: config.id,
        commandName: interaction.commandName,
        username: interaction.user.username,
        channelName: interaction.channel?.name || 'unknown',
        success: false,
        errorMessage: error.message,
        responseTime: 0,
      });

      await interaction.reply({
        content: '❌ An error occurred while processing your command.',
        ephemeral: true,
      });
    }
  }

  async handleHelpCommand(interaction: ChatInputCommandInteraction, config: any) {
    const helpMessage = `🤖 **${config.botName} Help**

**Available Commands:**
• \`/help\` - Show this help message
• \`/support\` - Get AI-powered support

**Bot Info:**
• **Server:** ${config.guildName}
• **Model:** ${config.aiModel}
• **Status:** ${config.isActive ? '🟢 Active' : '🔴 Inactive'}

Need help? Contact a server administrator.`;

    await interaction.reply({
      content: helpMessage,
      ephemeral: true,
    });
  }

  async handleSupportCommand(interaction: ChatInputCommandInteraction, config: any) {
    const question = interaction.options.getString('question');
    
    if (!question) {
      await interaction.reply({
        content: '❌ Please provide a question for support.',
        ephemeral: true,
      });
      return;
    }

    // Defer reply since AI processing might take time
    await interaction.deferReply({ ephemeral: true });

    try {
      // Here you would integrate with OpenAI/OpenRouter API
      // For now, we'll provide a placeholder response
      const response = `🤖 **AI Support Response**

**Your Question:** ${question}

**Response:** This is a placeholder response. In a real implementation, this would be generated by the AI model (${config.aiModel}) based on your system prompt and policy documents.

**Note:** AI integration is not yet implemented in this development version.`;

      await interaction.editReply(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      await interaction.editReply('❌ Failed to generate AI response. Please try again later.');
    }
  }

  async registerCommands(configId: string): Promise<boolean> {
    try {
      const config = await this.storage.getBotConfig(configId);
      if (!config) return false;

      const bot = this.bots.get(configId);
      if (!bot) {
        console.error(`Bot not running for config: ${configId}`);
        return false;
      }

      // Register slash commands
      const commands = [
        {
          name: 'help',
          description: 'Show help information',
        },
        {
          name: 'support',
          description: 'Get AI-powered support',
          options: [
            {
              name: 'question',
              description: 'Your support question',
              type: 3, // STRING
              required: true,
            },
          ],
        },
      ];

      // Register commands for the specific guild
      await bot.client.application?.commands.set(commands, config.guildId);
      
      console.log(`✅ Commands registered for guild: ${config.guildName}`);
      return true;
    } catch (error) {
      console.error('Error registering commands:', error);
      return false;
    }
  }

  getActiveBots(): string[] {
    return Array.from(this.bots.keys());
  }

  isBotActive(configId: string): boolean {
    return this.bots.has(configId);
  }
}

export const botManager = new DiscordBotManager(); 