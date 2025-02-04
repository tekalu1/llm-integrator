import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import * as path from 'path';

// FlowItem や SavedFlowItem の型は必要に応じて定義してください
export type FlowItem = any

export type SavedFlowItem = {
  id: string
  flowItem: FlowItem
  createdAt: number
  updatedAt: number
}

interface DataSchema {
  savedFlowItems: SavedFlowItem[]
}


export async function initDB() {
    const filePath = join("./server/db/flow-store", 'db.json')
    
    const dir = path.dirname(filePath);
    // ディレクトリが無ければ作成
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true })
    }
    
    const adapter = new JSONFile(filePath)
    const db = new Low(adapter,adapter)
    await db.read()
    // db.data が存在しなければ初期値をセット
    db.data ||= { savedFlowItems: [] }
    return db
}
