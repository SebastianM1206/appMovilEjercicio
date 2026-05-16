import Dexie, { type Table } from 'dexie';
import type { OutboxOp, RunEvent, RunPoint, RunSession } from '../../shared/types';
import { schemaV1, schemaV2 } from './schema';

export type DexieDbConfig = {
  name: string;
  version: number;
};

export const dexieDbConfig: DexieDbConfig = {
  name: 'movilesFinal',
  version: 2,
};

export class AppDexieDb extends Dexie {
  runs!: Table<
    { id: string; startedAt: number; distanceMeters: number; durationSec: number },
    string
  >;
  sessions!: Table<RunSession, string>;
  points!: Table<RunPoint, number>;
  events!: Table<RunEvent, number>;
  outbox!: Table<OutboxOp, number>;

  constructor() {
    super(dexieDbConfig.name);

    this.version(1).stores(schemaV1);
    this.version(2).stores(schemaV2);
  }
}

export const appDb = new AppDexieDb();
