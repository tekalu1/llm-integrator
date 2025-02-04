import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';

async function getDocumentData(filePath) {
  const dir = path.dirname(filePath);
  console.log(dir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter, adapter);
  await db.read();
  db.data ||= {
    name: "test document",
    vectors: []
  };
  return db.data;
}
async function setDocumentData(filePath, dbData) {
  const dir = path.dirname(filePath);
  console.log(dir);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const adapter = new JSONFile(filePath);
  const db = new Low(adapter, adapter);
  await db.read();
  db.data ||= {
    name: "test document",
    vectors: []
  };
  if (dbData) {
    db.data = {
      name: "test document",
      vectors: dbData
    };
    await db.write();
  }
}

export { getDocumentData as g, setDocumentData as s };
//# sourceMappingURL=lowdbClient2.mjs.map
