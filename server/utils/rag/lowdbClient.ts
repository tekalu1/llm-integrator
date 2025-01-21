// server/utils/lowdbClient.ts
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs'
import * as path from 'path';

// lowDB に保存したいデータ構造
type VectorData = {
  id: string
  embedding: number[]
  metadata: Record<string, any>
}

type Data = {
  name: string
  vectors: VectorData[]
}


export async function getDocumentData(filePath: string) {
  const dir = path.dirname(filePath);
  console.log(dir)

  // ディレクトリが無ければ作成
  if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
  }
  
  // JSONFile アダプタを用いて "db.json" に保存
  const adapter = new JSONFile(filePath)
  const db = new Low(adapter,adapter)

  // db.json を読み込み
  await db.read()
  // データ構造が未定義なら初期化
  db.data ||= { 
    name: 'test document',
    vectors: [] as VectorData[] 
  } as Data

  return db.data
}

export async function setDocumentData(filePath: string, dbData: VectorData[]) {
  const dir = path.dirname(filePath);
  console.log(dir)

  // ディレクトリが無ければ作成
  if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true })
  }
  
  // JSONFile アダプタを用いて "db.json" に保存
  const adapter = new JSONFile(filePath)
  const db = new Low(adapter,adapter)

  // db.json を読み込み
  await db.read()
  // データ構造が未定義なら初期化
  db.data ||= { 
    name: 'test document',
    vectors: [] as VectorData[]
  } as Data

  if(dbData){
    db.data = { 
      name: 'test document',
      vectors: dbData
    } as Data
    await db.write()
  }
}
