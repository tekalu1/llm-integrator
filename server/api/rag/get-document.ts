// server/api/upsert-chunks.post.ts
import { defineEventHandler, readBody } from 'h3'
import { getDocumentData } from '~/server/utils/rag/lowdbClient'
import { getEmbeddingOpenAI } from '~/server/utils/rag/openaiEmbedding'
import { v4 as uuidv4 } from 'uuid';

interface RequestBody {
  userId: number,
  documentId: string,
  version: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RequestBody>(event)
  const { userId, documentId, version } = body
  const filePath = `./server/db/rag/${userId}/${documentId}/${version}.json`

  // lowDB を初期化(読み込み)
  const db = await getDocumentData(filePath)

  return {
    status: 'success',
    db: db
  }
})
