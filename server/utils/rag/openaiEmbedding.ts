// server/utils/openaiEmbedding.ts
import { OpenAI } from 'openai'

/**
 * 単一テキストのEmbeddingを取得（OpenAI）
 */
export async function getEmbeddingOpenAI(text: string, apiKey: string): Promise<number[]> {
    const openai = new OpenAI({apiKey: apiKey});
    // 実際には "text-embedding-ada-002" の利用が一般的です
    const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',  // ここを実環境のモデル名へ置き換えてください
        input: text
    })
    // response.data.data[0].embedding にベクトルが入っている
    return response.data[0].embedding
}
