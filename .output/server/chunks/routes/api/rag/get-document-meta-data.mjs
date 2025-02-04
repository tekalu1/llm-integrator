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

const getDocumentMetaData = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId, documentId, version } = body;
  const filePath = `./server/db/rag/${userId}/${documentId}/${version}.json`;
  try {
    const db = await getDocumentData(filePath);
    console.log(JSON.stringify(db));
    const metaData = db.vectors.map((vector) => vector.metadata?.text);
    return {
      status: "success",
      documentName: db.name,
      metaData
    };
  } catch (e) {
    return {
      result: {},
      error: e.message
    };
  }
});

export { getDocumentMetaData as default };
//# sourceMappingURL=get-document-meta-data.mjs.map
