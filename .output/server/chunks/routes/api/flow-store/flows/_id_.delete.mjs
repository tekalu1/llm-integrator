import { d as defineEventHandler, c as createError } from '../../../../nitro/nitro.mjs';
import { i as initDB } from '../../../../_/lowdbClient.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'lowdb';
import 'lowdb/node';
import 'fs';
import 'path';

const _id__delete = defineEventHandler(async (event) => {
  const { id } = event.context.params;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id parameter" });
  }
  const db = await initDB();
  const index = db.data.savedFlowItems.findIndex((item) => item.id === id);
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found" });
  }
  db.data.savedFlowItems.splice(index, 1);
  await db.write();
  return { success: true };
});

export { _id__delete as default };
//# sourceMappingURL=_id_.delete.mjs.map
