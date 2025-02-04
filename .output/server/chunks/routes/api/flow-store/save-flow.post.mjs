import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { i as initDB } from '../../../_/lowdbClient.mjs';
import { v as v4 } from '../../../_/v4.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'lowdb';
import 'lowdb/node';
import 'fs';
import 'path';
import 'node:crypto';

const saveFlow_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  if (!body.flowItem) {
    throw createError({ statusCode: 400, statusMessage: "Missing flowItem" });
  }
  const db = await initDB();
  let savedFlowItem;
  if (body.isSaveAs || !body.id) {
    savedFlowItem = {
      id: v4(),
      flowItem: body.flowItem,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (!Array.isArray(db.data.savedFlowItems)) {
      db.data.savedFlowItems = [];
    }
    db.data.savedFlowItems.push(savedFlowItem);
  } else {
    const index = db.data.savedFlowItems.findIndex((item) => item.id === body.id);
    savedFlowItem = {
      id: body.id,
      flowItem: body.flowItem,
      createdAt: index !== -1 ? db.data.savedFlowItems[index].createdAt : Date.now(),
      updatedAt: Date.now()
    };
    if (index !== -1) {
      db.data.savedFlowItems[index] = savedFlowItem;
    } else {
      db.data.savedFlowItems.push(savedFlowItem);
    }
  }
  await db.write();
  return savedFlowItem;
});

export { saveFlow_post as default };
//# sourceMappingURL=save-flow.post.mjs.map
