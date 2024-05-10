import { sql } from 'kysely';
import { db } from './connection';
import Persistence from './persistence-singleton';

export const persistence = new Persistence(db, sql);
