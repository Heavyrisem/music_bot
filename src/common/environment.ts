import z from 'zod';

const environmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  token: z.string(),
  application_id: z.string(),
  guild_id: z.string(),
});

export const environment = environmentSchema.parse(process.env);