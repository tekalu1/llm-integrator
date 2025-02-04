import { d as defineEventHandler, r as readBody, c as createError } from '../../../nitro/nitro.mjs';
import { promises } from 'fs';
import path__default from 'path';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';

const getDocumentList_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { userId } = body;
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: "userId is required"
    });
  }
  const dbPath = path__default.resolve("./server/db/rag", userId + "");
  try {
    const documentDirs = await promises.readdir(dbPath);
    const documents = await Promise.all(
      documentDirs.map(async (documentId) => {
        const documentPath = path__default.join(dbPath, documentId);
        const versions = await promises.readdir(documentPath);
        return versions.map((version) => ({
          documentId,
          version: path__default.basename(version, ".json")
          // ".json"を除去
        }));
      })
    );
    return documents.flat();
  } catch (error) {
    if (error.code === "ENOENT") {
      throw createError({
        statusCode: 404,
        statusMessage: "User not found or no documents available"
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error"
    });
  }
});

export { getDocumentList_post as default };
//# sourceMappingURL=get-document-list.post.mjs.map
