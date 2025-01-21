// server/api/upsert-chunks.post.ts
import { defineEventHandler, readBody } from 'h3'
import { getDocumentData, setDocumentData } from '~/server/utils/rag/lowdbClient'
import { getEmbeddingOpenAI } from '~/server/utils/rag/openaiEmbedding'
import { v4 as uuidv4 } from 'uuid';

interface UpsertChunksRequestBody {
  apiKey: string,
  chunks: string[],
  userId: number,
  documentId: string,
  version: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<UpsertChunksRequestBody>(event)
  const { apiKey, chunks, userId, documentId, version } = body

  let documentIdTemp = documentId
  let versionTemp = version


  if(!documentId){
    documentIdTemp = uuidv4();
  }

  if(!version){
    versionTemp = 1
  }

  const filePath = `./server/db/rag/${userId}/${documentIdTemp}/${versionTemp}.json`

  if (!chunks || chunks.length === 0) {
    throw new Error('No chunks provided')
  }

  // lowDB を初期化(読み込み)
  const db = await getDocumentData(filePath)

  // 既存データ
  const existingVectors = db.vectors ?? []

  // 新たに upsert するデータを作成
  for (let i = 0; i < chunks.length; i++) {
    const chunk = chunks[i]
    const embedding = await getEmbeddingOpenAI(chunk, apiKey)

    // IDとして `chunk-{i}` を仮採用。
    // 必要に応じて、同じIDが存在したら上書き or スキップなどのロジックを入れてください。
    existingVectors.push({
      id: `chunk-${i}`,
      embedding,
      metadata: {
        text: chunk,
        chunkIndex: i
      }
    })
  }

  // db.data を更新して書き込み
  await setDocumentData(filePath, existingVectors)

  return {
    status: 'success',
    upserted: chunks.length,
    documentId: documentIdTemp,
    version: versionTemp
  }
})
