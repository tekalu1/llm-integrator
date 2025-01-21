import { promises as fs } from 'fs';
import path from 'path';

export default defineEventHandler(async (event) => {
  // リクエストボディから userId を取得
  const body = await readBody(event);
  const { userId } = body;

  // `userId` が指定されていない場合はエラーを返す
  if (!userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'userId is required',
    });
  }

  // データベースのルートディレクトリ
  const dbPath = path.resolve('./server/db/rag', userId + '');

  try {
    // ユーザーのディレクトリを読み取る
    const documentDirs = await fs.readdir(dbPath);

    const documents = await Promise.all(
      documentDirs.map(async (documentId) => {
        const documentPath = path.join(dbPath, documentId);
        const versions = await fs.readdir(documentPath);

        return versions.map((version) => ({
          documentId,
          version: path.basename(version, '.json'), // ".json"を除去
        }));
      })
    );

    // 結果をフラットなリストに変換
    return documents.flat();
  } catch (error) {
    if (error.code === 'ENOENT') {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found or no documents available',
      });
    }
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error',
    });
  }
});
