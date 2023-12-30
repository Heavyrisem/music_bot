import { generateDependencyReport } from '@discordjs/voice';
import { Client, GatewayIntentBits } from 'discord.js';
import prettyms from 'pretty-print-ms';

import packageJson from '../package.json';
import { Command } from './command/command.constant';
import {
  handleGetQueue,
  handleSearchMusic,
  handleSkip,
  testHandler,
} from './command/handler/music';
import { registerCommands } from './command/register-command';
import { environment } from './common/environment';
import { guildManager } from './common/guild-manager';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
    // Intents.FLAGS.GUILDS,
    // Intents.FLAGS.GUILD_MESSAGES,
    // Intents.FLAGS.GUILD_VOICE_STATES,
    // Intents.FLAGS.GUILD_PRESENCES,
  ],
});

client.on('ready', async () => {
  console.log(`Logged in as ${client?.user?.tag}!`);
  console.log(generateDependencyReport());

  const guildNames = (await client.guilds.fetch()).keys();

  for (let n = guildNames.next(); !n.done; n = guildNames.next()) {
    const guildName = n.value;
    guildManager.addGuild(guildName);
  }

  setInterval(() => {
    client.uptime &&
      client.user?.setActivity(`v${packageJson.version} | ${prettyms(client.uptime)}`);
  }, 5000);

  registerCommands(environment.token, environment.application_id);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  try {
    switch (commandName) {
      case Command.PING:
        await interaction.reply(`\`${client.ws.ping}\``);
        break;
      case Command.TEST:
        await testHandler(interaction);
        // const guild = guildManager.getGuild(interaction.guildId as string);
        // await guild?.musicManager.play(interaction, '2_uODrqH2aE');
        break;
      case Command.PLAY:
      case Command.PLAY_1:
        await handleSearchMusic(interaction);
        break;
      case Command.QUEUE:
        await handleGetQueue(interaction);
        break;
      case Command.SKIP:
      case Command.SKIP_1:
        await handleSkip(interaction);
        break;
      default:
        await interaction.reply({ content: `\`명령어를 찾을 수 없습니다.\``, ephemeral: true });
    }
  } catch (error) {
    console.error('Global Error Handler:', error);
    await interaction.channel?.send(`\`오류가 발생했습니다.\nReason: ${error}\``);
  }
});

client.login(environment.token);
