import {
  InValue,
  Client as LibsqlClient,
  createClient,
} from '@libsql/client/web';
import { Router, RouterType } from 'itty-router';
import { EMAIL, ENV_OBJ } from '../lib/validations';

export interface Env {
  // The environment variable containing your the URL for your Turso database.
  LIBSQL_DB_URL?: string;
  // The Secret that contains the authentication token for your Turso database.
  LIBSQL_DB_AUTH_TOKEN?: string;

  // These objects are created before first use, then stashed here
  // for future use
  router?: RouterType;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (env.router === undefined) {
      env.router = buildRouter(env);
    }

    return env.router.handle(request);
  },
};

function buildLibsqlClient(env: Env): LibsqlClient {
  //   const envObj = ENV_OBJ.safeParse(env);
  //   if (!envObj.success) {
  //     throw new Error(envObj.error.message);
  //   }

  const url = env.LIBSQL_DB_URL?.trim();
  if (!url) throw new Error('Missing LIBSQL_DB_URL');

  const authToken = env.LIBSQL_DB_AUTH_TOKEN?.trim();
  if (!authToken) throw new Error('Missing LIBSQL_DB_AUTH_TOKEN');

  return createClient({ url, authToken });
}

function buildRouter(env: Env): RouterType {
  const router = Router();

  router.get('/users', async () => {
    const client = buildLibsqlClient(env);
    const rs = await client.execute('select * from example_users');
    return Response.json(rs);
  });

  router.get('/add-user', async (request) => {
    const client = buildLibsqlClient(env);
    const email = EMAIL.safeParse(request.query.email);
    if (!email.success) {
      return new Response(email.error.message, { status: 400 });
    }

    try {
      await client.execute({
        sql: 'insert into example_users values (?)',
        args: [email.data],
      });
    } catch (e) {
      console.error(e);
      return new Response('database insert failed');
    }

    return new Response('Added');
  });

  router.all('*', () => new Response('Not Found.', { status: 404 }));

  return router;
}
