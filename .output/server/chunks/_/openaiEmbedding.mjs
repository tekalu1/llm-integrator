import { OpenAI } from 'openai';

async function getEmbeddingOpenAI(text, apiKey) {
  const openai = new OpenAI({ apiKey });
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    // ここを実環境のモデル名へ置き換えてください
    input: text
  });
  return response.data[0].embedding;
}

export { getEmbeddingOpenAI as g };
//# sourceMappingURL=openaiEmbedding.mjs.map
