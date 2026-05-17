import fs from 'fs';
import path from 'path';
import type { Database } from './types';
import initialDb from '@/data/db.json';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export function readDb(): Database {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data) as Database;
  } catch {
    return initialDb as unknown as Database;
  }
}

export function writeDb(data: Database) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (e) {
    console.warn('writeDb: could not write to filesystem', e);
  }
}
