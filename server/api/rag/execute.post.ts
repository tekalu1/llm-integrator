// server/api/rag.post.ts
import { defineEventHandler, readBody } from 'h3'
import { getDocumentData } from '~/server/utils/rag/lowdbClient'
import { getEmbeddingOpenAI } from '~/server/utils/rag/openaiEmbedding'
import { OpenAI } from 'openai'
import { v4 as uuidv4 } from 'uuid';

interface RagRequestBody {
  apiKey: string,
  query: string,
  userId: string,
  documentId: string,
  version: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<RagRequestBody>(event)
  const { apiKey, query, userId, documentId, version } = body
  let filePath = ''

  if(userId && documentId && version){
    filePath = `./server/db/rag/${userId}/${documentId}/${version}.json`

  }else{
    return {
      result: {},
      error: "Error: The response is missing one or more required fields: userId, documentId, or version."
    }
  }

  if (!query) {
    throw new Error('No query provided.')
  }

  // 1. クエリをEmbedding化
  const queryEmbedding = await getEmbeddingOpenAI(query, apiKey)

  // 2. lowDBを読み込み、全件から類似度上位K件を探す
  const db = await getDocumentData(filePath)
  const allVectors = db.vectors ?? []

  const topK = 3
  // 全てのチャンクに対してコサイン類似度を計算し、ソートして上位を取得
  const scoredChunks = allVectors.map((v) => {
    const sim = cosineSimilarity(queryEmbedding, v.embedding)
    return { ...v, similarity: sim }
  })

  // similarity の降順で上位を取得
  scoredChunks.sort((a, b) => b.similarity - a.similarity)
  const matchedChunks = scoredChunks.slice(0, topK)

  // 3. matchedChunks をコンテキストとして LLM に投げる
  const contextText = matchedChunks.map((m) => m.metadata.text).join('\n---\n')

  const openai = new OpenAI({apiKey: apiKey})

  const systemPrompt = `
あなたはカスタム知識ベースを持つ有能なアシスタントです。
以下のCONTEXTをもとに、ユーザの質問に対して日本語で回答をしてください。

CONTEXT:
${contextText}

ユーザの質問:
${query}
`

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4o', // 必要に応じて変更
    messages: [
      { role: 'system', content: systemPrompt }
    ]
  })

  const answer = chatResponse.choices[0].message?.content || ''

  return {
    query,
    answer,
    context: matchedChunks.map((c) => c.metadata.text),
  }
})

/**
 * コサイン類似度を計算する関数
 * v1, v2: 同次元数のベクトル
 */
function cosineSimilarity(v1: number[], v2: number[]): number {
  const dotProduct = v1.reduce((acc, cur, i) => acc + cur * v2[i], 0)
  const norm1 = Math.sqrt(v1.reduce((acc, cur) => acc + cur * cur, 0))
  const norm2 = Math.sqrt(v2.reduce((acc, cur) => acc + cur * cur, 0))
  return dotProduct / (norm1 * norm2)
}
