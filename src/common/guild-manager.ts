import { MusicManager } from './music-manager';

export interface GuildData {
  musicManager: MusicManager;
}

class GuildManager {
  private guilds: Map<string, GuildData> = new Map();

  constructor() {}

  public getGuild(guildId: string) {
    return this.guilds.get(guildId);
  }

  public getGuildOrCreate(guildId: string) {
    if (!this.hasGuild(guildId)) return this.addGuild(guildId);
    return this.getGuild(guildId) as GuildData;
  }

  public hasGuild(guildId: string) {
    return this.guilds.has(guildId);
  }

  public addGuild(guildId: string) {
    if (this.hasGuild(guildId)) return this.getGuild(guildId) as GuildData;

    const newGuild = {
      musicManager: new MusicManager(guildId),
    };
    this.guilds.set(guildId, newGuild);
    return newGuild;
  }
}

export const guildManager = new GuildManager();
