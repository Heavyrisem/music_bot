import { Client, GatewayIntentBits } from 'discord.js';
import prettyms from 'pretty-print-ms';

import packageJson from '../package.json';
import { registerCommands } from './command/register-command';
import { environment } from './common/environment';
import { Command } from './command/command.constant';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.on('ready', () => {
  console.log(`Logged in as ${client?.user?.tag}!`);

  setInterval(() => {
    client.uptime &&
      client.user?.setActivity(`v${packageJson.version} | ${prettyms(client.uptime)}`);
  }, 5000);

  registerCommands(environment.token, environment.application_id);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

    switch (commandName) {
        case Command.PING:
            await interaction.reply(`\`${client.ws.ping}\``);
            break;
        case 
    }
}

client.login(environment.token);
