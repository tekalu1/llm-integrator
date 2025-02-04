import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const register_post = defineEventHandler(async (event) => {
  event.node;
  const { flowItem, variables, userId } = await readBody(event);
  const dir = "./server/db/publish-flow/";
  const file = dir + userId + ".json";
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  const adapter = new JSONFile(file);
  const db = new Low(adapter, adapter);
  await db.read();
  console.log("db.data : " + JSON.stringify(db.data));
  if (!db.data) {
    db.data = {};
    await db.write();
  }
  const newPublishedFlowItem = {
    version: 0,
    flowItem,
    variables
  };
  if (!Array.isArray(db.data[flowItem.id])) {
    db.data[flowItem.id] = [];
  }
  db.data[flowItem.id].push(newPublishedFlowItem);
  await db.write();
  return { success: true };
});

export { register_post as default };
//# sourceMappingURL=register.post.mjs.map
