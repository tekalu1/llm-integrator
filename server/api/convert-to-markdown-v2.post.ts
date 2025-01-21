import MarkitDown from 'filetomarkdown';
import { H3Event, readMultipartFormData } from 'h3';
import { promises as fs } from 'fs';
import path from 'path';
import { existsSync, mkdirSync } from 'fs'

export default defineEventHandler(async (event: H3Event) => {
    const dir = './server/tmp/'

    // ディレクトリが無ければ作成
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }

    // マルチパートフォームデータの取得
    const formData = await readMultipartFormData(event);

    if (!formData || !formData[0]) {
    return { error: 'No file uploaded' };
    }

    const file = formData[0]; // 最初のファイルを取得
    const tempFilePath = path.resolve(dir, file.filename);
    const tempFilePathOut = path.resolve(dir, 'out.txt');

    try {
    // 一時的にファイルを保存
    await fs.writeFile(tempFilePath, file.data);

    // ファイルを変換
    const markdown = await MarkitDown.convertToMarkdown(tempFilePath);

    // 一時ファイルを削除
    await fs.unlink(tempFilePath);
    // await fs.unlink(tempFilePathOut);

    return { markdown };
    } catch (error) {
        console.error('Error converting file:', error);
        return { error: 'Conversion failed' };
    }
});
