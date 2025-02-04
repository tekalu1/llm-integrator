import { d as defineEventHandler, r as readBody } from '../../../nitro/nitro.mjs';
import { g as getDocumentData } from '../../../_/lowdbClient2.mjs';
import { g as getEmbeddingOpenAI } from '../../../_/openaiEmbedding.mjs';
import { OpenAI } from 'openai';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import 'lowdb';
import 'lowdb/node';
import 'fs';
import 'path';

const execute_post = defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { apiKey, query, userId, documentId, version } = body;
  let filePath = "";
  if (userId && documentId && version) {
    filePath = `./server/db/rag/${userId}/${documentId}/${version}.json`;
  } else {
    return {
      result: {},
      error: "Error: The response is missing one or more required fields: userId, documentId, or version."
    };
  }
  if (!query) {
    throw new Error("No query provided.");
  }
  const queryEmbedding = await getEmbeddingOpenAI(query, apiKey);
  const db = await getDocumentData(filePath);
  const allVectors = db.vectors ?? [];
  const topK = 3;
  const scoredChunks = allVectors.map((v) => {
    const sim = cosineSimilarity(queryEmbedding, v.embedding);
    return { ...v, similarity: sim };
  });
  scoredChunks.sort((a, b) => b.similarity - a.similarity);
  const matchedChunks = scoredChunks.slice(0, topK);
  const contextText = matchedChunks.map((m) => m.metadata.text).join("\n---\n");
  const openai = new OpenAI({ apiKey });
  const systemPrompt = `
\u3042\u306A\u305F\u306F\u30AB\u30B9\u30BF\u30E0\u77E5\u8B58\u30D9\u30FC\u30B9\u3092\u6301\u3064\u6709\u80FD\u306A\u30A2\u30B7\u30B9\u30BF\u30F3\u30C8\u3067\u3059\u3002
\u4EE5\u4E0B\u306ECONTEXT\u3092\u3082\u3068\u306B\u3001\u30E6\u30FC\u30B6\u306E\u8CEA\u554F\u306B\u5BFE\u3057\u3066\u65E5\u672C\u8A9E\u3067\u56DE\u7B54\u3092\u3057\u3066\u304F\u3060\u3055\u3044\u3002

CONTEXT:
${contextText}

\u30E6\u30FC\u30B6\u306E\u8CEA\u554F:
${query}
`;
  const chatResponse = await openai.chat.completions.create({
    model: "gpt-4o",
    // 必要に応じて変更
    messages: [
      { role: "system", content: systemPrompt }
    ]
  });
  const answer = chatResponse.choices[0].message?.content || "";
  return {
    query,
    answer,
    context: matchedChunks.map((c) => c.metadata.text)
  };
});
function cosineSimilarity(v1, v2) {
  const dotProduct = v1.reduce((acc, cur, i) => acc + cur * v2[i], 0);
  const norm1 = Math.sqrt(v1.reduce((acc, cur) => acc + cur * cur, 0));
  const norm2 = Math.sqrt(v2.reduce((acc, cur) => acc + cur * cur, 0));
  return dotProduct / (norm1 * norm2);
}

export { execute_post as default };
//# sourceMappingURL=execute.post.mjs.map
