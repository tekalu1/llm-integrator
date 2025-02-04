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

const _id__get = defineEventHandler(async (event) => {
  const { id } = event.context.params;
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: "Missing id parameter" });
  }
  const db = await initDB();
  const savedFlowItem = db.data.savedFlowItems.find((item) => item.id === id);
  if (!savedFlowItem) {
    throw createError({ statusCode: 404, statusMessage: "Flow not found" });
  }
  return savedFlowItem;
});

export { _id__get as default };
//# sourceMappingURL=_id_.get.mjs.map
