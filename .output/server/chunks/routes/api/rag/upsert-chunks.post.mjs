import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { g as getDocumentData, s as setDocumentData } from '../../../_/lowdbClient2.mjs';
import { g as getEmbeddingOpenAI } from '../../../_/openaiEmbedding.mjs';
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
import 'openai';
import 'node:crypto';

const upsertChunks_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { apiKey, chunks, userId, documentId, version } = body;
  let documentIdTemp = documentId;
  let versionTemp = version;
  if (!documentId) {
    documentIdTemp = v4();
  }
  if (!version) {
    versionTemp = 1;
  }
  const filePath = `./server/db/rag/${userId}/${documentIdTemp}/${versionTemp}.json`;
  if (!chunks || chunks.length === 0) {
    throw new Error("No chunks provided");
  }
  const db = await getDocumentData(filePath);
  const existingVectors = db.vectors ?? [];
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i];
    const embedding = await getEmbeddingOpenAI(chunk, apiKey);
    existingVectors.push({
      id: `chunk-${i}`,
      embedding,
      metadata: {
        text: chunk,
        chunkIndex: i
      }
    });
  }
  await setDocumentData(filePath, existingVectors);
  return {
    status: "success",
    upserted: chunks.length,
    documentId: documentIdTemp,
    version: versionTemp
  };
});

export { upsertChunks_post as default };
//# sourceMappingURL=upsert-chunks.post.mjs.map
