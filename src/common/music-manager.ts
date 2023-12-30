import {
  AudioPlayer,
  AudioPlayerStatus,
  AudioResource,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  entersState,
  joinVoiceChannel,
} from '@discordjs/voice';
import { CacheType, ChatInputCommandInteraction, VoiceBasedChannel } from 'discord.js';
import ytdl from 'ytdl-core';

export interface MusicInfo {
  title: string;
  artist: string;
  youtubeId: string;
  duration: string;
  ownedBy: string;
}

export class MusicManager {
  private player: AudioPlayer;
  private resource: AudioResource<null> | undefined;
  private queue: MusicInfo[];

  constructor(readonly guildId: string) {
    this.player = createAudioPlayer();
    this.resource = undefined;
    this.queue = [];
  }

  getPlayerState() {
    return this.player.state.status;
  }

  getQueue() {
    return this.queue;
  }

  addQueue(info: MusicInfo) {
    this.queue.push(info);
  }

  stop() {
    this.player.stop(true);
    this.resource = undefined;
    this.queue = [];
  }

  skipCurrent() {
    this.player.stop();
    this.resource = undefined;
  }

  async play(interaction: ChatInputCommandInteraction<CacheType>, info: MusicInfo) {
    const videoInfo = await ytdl.getInfo(info.youtubeId);
    const format = ytdl.chooseFormat(videoInfo.formats, { filter: 'audioonly' });

    const stream = ytdl(info.youtubeId, { format });
    const connection = this.joinVoiceChannel(interaction);
    // const connection = await getVoiceConnection(this.guildId);
    if (!connection) interaction.channel?.send('`음성 채널 연결에 실패했어요`');

    await entersState(connection, VoiceConnectionStatus.Ready, 5000).catch(() => {
      interaction.channel?.send('`음성 채널 준비에 실패했어요`');
    });

    this.resource = createAudioResource(stream, { inlineVolume: true });
    this.resource.volume?.setVolume(50 / 1000);

    this.player.play(this.resource);

    this.player.once(AudioPlayerStatus.Playing, () => {
      interaction.channel?.send(
        `\`${info.title} - ${info.artist} (${info.duration}) 을 재생합니다.\``,
      );
    });

    this.player.once(
      AudioPlayerStatus.Idle,
      (oldState: { status: AudioPlayerStatus }, newState: { status: AudioPlayerStatus }) => {
        // console.log('old', oldState, 'new', newState);
        if (newState.status === AudioPlayerStatus.Idle) {
          this.queue.shift();
          if (this.queue.length > 0) {
            this.play(interaction, this.queue[0]);
          }
        }
      },
    );

    connection.subscribe(this.player);
    await entersState(this.player, AudioPlayerStatus.Playing, 5000);
  }

  joinVoiceChannel(interaction: ChatInputCommandInteraction<CacheType>) {
    const voiceChannel = this.getVoiceChannel(interaction, interaction.user.id);

    if (!voiceChannel)
      throw new Error(`${interaction.user.id}, 참여할 음성 채널을 찾지 못했습니다.`);

    return joinVoiceChannel({
      debug: true,
      channelId: voiceChannel.id,
      guildId: voiceChannel.guildId ?? this.guildId,
      adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });
  }

  private getVoiceChannel(
    interaction: ChatInputCommandInteraction<CacheType>,
    userId: string,
  ): VoiceBasedChannel | null {
    if (!interaction.guildId) return null;

    const guild = interaction.client.guilds.cache.get(interaction.guildId);
    if (guild && interaction.member) {
      const member = guild.members.cache.get(userId);
      if (member) {
        const voiceChannel = member.voice.channel;

        return voiceChannel;
      }
    }
    return null;
  }
}
