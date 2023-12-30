import { VoiceManager } from './voice-manager';

export interface GuildData {
  voiceManager: VoiceManager;
}

class GuildManager {
  constructor() {}

  public async addGuild(guildId: string) {}
}

export const guildManager = new GuildManager();
