import { REST, Routes, SlashCommandBuilder } from 'discord.js';

import { Command, CommandArgs } from './command.constant';

const commands = [
  new SlashCommandBuilder().setName(Command.PING).setDescription('핑을 표시합니다.'),
  ...[Command.PLAY, Command.PLAY_1].map((command) =>
    new SlashCommandBuilder()
      .setName(command)
      .setDescription('음악을 재생합니다.')
      .addStringOption((option) =>
        option
          .setName(CommandArgs.MUSIC_META)
          .setDescription('검색어 혹은 유튜브 URL')
          .setRequired(true),
      ),
  ),
  ...[Command.SKIP, Command.SKIP_1].map((command) =>
    new SlashCommandBuilder().setName(command).setDescription('음악을 스킵합니다.'),
  ),
  ...[Command.STOP, Command.STOP_1].map((command) =>
    new SlashCommandBuilder().setName(command).setDescription('음악을 정지합니다.'),
  ),
  new SlashCommandBuilder().setName(Command.QUEUE).setDescription('큐를 표시합니다.'),
  // new SlashCommandBuilder()
  //   .setName(Command.VOLUME)
  //   .setDescription('볼륨을 조정합니다.')
  //   .addIntegerOption((option) =>
  //     option.setName(CommandArgs.VOLUME).setDescription('볼륨 입력').setRequired(true),
  //   ),
  new SlashCommandBuilder().setName(Command.TEST).setDescription('테스트'),
];

export const registerCommands = async (token: string, clientId: string) => {
  const rest = new REST().setToken(token);
  const GUILD_ID = '269848346422804501';
  await rest.put(Routes.applicationCommands(clientId), { body: commands });
  await rest.put(Routes.applicationGuildCommands(clientId, GUILD_ID), {
    body: commands,
  });
  console.log('Commands Register Complete');
};
