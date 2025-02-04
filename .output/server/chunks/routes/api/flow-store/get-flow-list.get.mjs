import { d as defineEventHandler } from '../../../nitro/nitro.mjs';
import { i as initDB } from '../../../_/lowdbClient.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'lowdb';
import 'lowdb/node';
import 'fs';
import 'path';

const getFlowList_get = defineEventHandler(async (event) => {
  const db = await initDB();
  return db.data.savedFlowItems;
});

export { getFlowList_get as default };
//# sourceMappingURL=get-flow-list.get.mjs.map
