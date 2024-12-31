import { AudioPlayerStatus } from '@discordjs/voice';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CacheType,
  ChatInputCommandInteraction,
  DiscordjsError,
} from 'discord.js';
import ytdl from 'ytdl-core';
// import { searchMusics } from '@heavyrisem/ytmusic';
import YoutubeMusic from 'ytmusic-api';

import { guildManager } from '../../common/guild-manager';
import { MusicInfo } from '../../common/music-manager';
import { formatSecondsToTime } from '../../utils/time';
import { CommandArgs } from '../command.constant';

export const testHandler = (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (!interaction.guildId) throw new Error('알 수 없는 서버입니다.');
  const guild = guildManager.getGuildOrCreate(interaction.guildId);

  guild.musicManager.joinVoiceChannel(interaction);
};

export const handleSearchMusic = async (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (!interaction.guildId) throw new Error('알 수 없는 서버입니다.');
  const guild = guildManager.getGuildOrCreate(interaction.guildId);

  const query = interaction.options.getString(CommandArgs.MUSIC_META, true);

  const youtubeRegex =
    /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
  const url = query.match(youtubeRegex);

  if (url) {
    const youtubeId = url[url.length - 1];
    const info = await ytdl.getInfo(youtubeId);

    const musicInfo: MusicInfo = {
      youtubeId,
      artist: info.videoDetails.ownerChannelName,
      title: info.videoDetails.title,
      duration: formatSecondsToTime(Number(info.videoDetails.lengthSeconds)),
      ownedBy: interaction.user.username,
    };

    guild.musicManager.addQueue(musicInfo);
    if (guild.musicManager.getPlayerState() === AudioPlayerStatus.Idle) {
      guild.musicManager.play(interaction, musicInfo);
      await interaction.reply(`\`${musicInfo.title}, URL 에서 음악을 불러왔습니다.\``);
    } else {
      await interaction.reply({
        content: `\`${musicInfo.title} - ${musicInfo.artist}, 재생 대기 목록에 추가되었습니다.\``,
      });
    }
  } else {
    const youtubeMusicApi = new YoutubeMusic();
    await youtubeMusicApi.initialize();
    const res = await youtubeMusicApi.searchSongs(query).then((res) => res.slice(0, 5));

    const userSelections = res.map((item, index) =>
      new ActionRowBuilder<ButtonBuilder>().addComponents(
        new ButtonBuilder()
          .setCustomId(String(index))
          .setLabel(
            `${index + 1}. ${item.name} - ${item.artist.name} (${item.duration})`.slice(0, 80),
          )
          .setStyle(ButtonStyle.Primary),
      ),
    );

    const userResponse = await interaction.reply({
      content: `\`재생할 음악을 선택해 주세요.\``,
      components: userSelections,
    });

    try {
      const userSelect = await userResponse.awaitMessageComponent({
        filter: (i) => i.user.id === interaction.user.id,
        time: 30000,
      });
      await userResponse.edit({ content: '`불러오는 중 입니다...`', components: [] });

      const selectedItem = res[Number(userSelect.customId)];
      if (!selectedItem.videoId)
        await interaction.editReply(`\`${userSelect.customId} 선택값이 잘못되었습니다.\``);

      if (
        !selectedItem.videoId ||
        !selectedItem.artist ||
        !selectedItem.name ||
        !selectedItem.duration
      )
        throw new Error('잘못된 음악 정보입니다.');

      const musicInfo: MusicInfo = {
        youtubeId: selectedItem.videoId,
        artist: selectedItem.artist.name,
        title: selectedItem.name,
        duration: selectedItem.duration.toString(),
        ownedBy: interaction.user.username,
      };

      guild.musicManager.addQueue(musicInfo);

      const connection = guild.musicManager.getJoinedVoiceConnection();
      if (
        connection === undefined &&
        guild.musicManager.getPlayerState() !== AudioPlayerStatus.Playing
      ) {
        guild.musicManager.play(interaction, musicInfo);
        await userResponse.delete();
      } else {
        await interaction.editReply({
          content: `\`${musicInfo.title} - ${musicInfo.artist}, 재생 대기 목록에 추가되었습니다.\``,
        });
      }
    } catch (error) {
      if (error instanceof DiscordjsError) {
        await interaction.editReply({ content: '`선택 시간이 초과되었어요.`', components: [] });
      } else {
        throw error;
      }
    }
  }
};

export const handleGetQueue = async (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (!interaction.guildId) throw new Error('알 수 없는 서버입니다.');
  const guild = guildManager.getGuildOrCreate(interaction.guildId);

  const queueString = guild.musicManager
    .getQueue()
    .map(
      (item, i) =>
        `${i + 1}. ${item.title} - ${item.artist} - (${item.duration}), by ${item.ownedBy}`,
    );
  await interaction.reply({
    content: `\`\`\`Swift\n${queueString.join('\n') || '큐가 비었습니다.'}\`\`\``,
  });
};

export const handleSkip = async (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (!interaction.guildId) throw new Error('알 수 없는 서버입니다.');
  const guild = guildManager.getGuildOrCreate(interaction.guildId);

  if (guild.musicManager.getQueue().length === 0)
    return await interaction.reply({ content: '`큐가 비어있습니다`' });

  guild.musicManager.skipCurrent();
  await interaction.reply({ content: '`현재 노래를 스킵했습니다`' });
};

export const handleStop = async (interaction: ChatInputCommandInteraction<CacheType>) => {
  if (!interaction.guildId) throw new Error('알 수 없는 서버입니다.');
  const guild = guildManager.getGuildOrCreate(interaction.guildId);

  guild.musicManager.stop();
  await interaction.reply({ content: '`모든 노래를 종료했습니다.`' });
};
