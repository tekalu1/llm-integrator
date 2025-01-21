import { cosineSimilarity } from 'some-math-lib'; // 適切なライブラリを使用

export const findSimilarChunks = (
  queryVector: number[],
  chunkEmbeddings: { id: string; vector: number[] }[],
  threshold = 0.8
) => {
  return chunkEmbeddings
    .map(({ id, vector }) => ({
      id,
      similarity: cosineSimilarity(queryVector, vector),
    }))
    .filter(({ similarity }) => similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity);
};
