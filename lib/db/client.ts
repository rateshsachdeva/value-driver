// lib/db/client.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const queryClient = postgres(process.env.POSTGRES_URL!, { prepare: false });

export const db = drizzle(queryClient, { schema });
