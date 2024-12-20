import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs'
import type { PublishedFlowItem } from '~/types/db/published-flow.ts';

export default defineEventHandler(async (event) => {
    const { req, res } = event.node;
    const { flowItem, variables, userId } = await readBody(event);

    const dir = './server/db/publish-flow/'
    const file = dir + userId + '.json'

    // ディレクトリが無ければ作成
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }

    const adapter = new JSONFile(file);
    const db = new Low(adapter,adapter);


    // データベースを読み込み
    await db.read();

    console.log("db.data : " + JSON.stringify(db.data))

    // デフォルトデータを適切に設定
    if (!db.data) {
        db.data = {}; // データが存在しない場合に初期化
        await db.write(); // 初期化をファイルに保存
    }
    
    const newPublishedFlowItem = {
        version: 0,
        flowItem: flowItem,
        variables: variables
    } as PublishedFlowItem

    if(!Array.isArray(db.data[flowItem.id])){
        db.data[flowItem.id] = []
    }

    db.data[flowItem.id].push(newPublishedFlowItem)

    await db.write()

    return { success: true }
})
