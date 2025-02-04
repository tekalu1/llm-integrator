import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { join } from 'path';

async function initDB() {
  const filePath = join("./server/db/flow-store", "db.json");
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter, adapter);
  await db.read();
  db.data ||= { savedFlowItems: [] };
  return db;
}

export { initDB as i };
//# sourceMappingURL=lowdbClient.mjs.map
