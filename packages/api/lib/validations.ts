import { z } from 'zod';

export const ENV_OBJ = z.object({
  LIBSQL_DB_URL: z.string().nonempty(),
  LIBSQL_DB_AUTH_TOKEN: z.string().nonempty(),
});

export const EMAIL = z.string().email();
