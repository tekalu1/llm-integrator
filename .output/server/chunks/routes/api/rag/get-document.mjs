import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { g as getDocumentData } from '../../../_/lowdbClient2.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'lowdb';
import 'lowdb/node';
import 'fs';
import 'path';

const getDocument = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, documentId, version } = body;
  const filePath = `./server/db/rag/${userId}/${documentId}/${version}.json`;
  const db = await getDocumentData(filePath);
  return {
    status: "success",
    db
  };
});

export { getDocument as default };
//# sourceMappingURL=get-document.mjs.map
