import { initDB  } from '~/server/utils/flow-store/lowdbClient'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)
    // 送信された JSON は、以下のような形を想定しています
    // {
    //   flowItem: { ... },
    //   isSaveAs: boolean,  // 新規保存の場合は true または id が存在しない
    //   id: string          // 既存フローの id（上書きの場合）
    // }
    if (!body.flowItem) {
    throw createError({ statusCode: 400, statusMessage: 'Missing flowItem' })
    }

    const db = await initDB()
    let savedFlowItem

    if (body.isSaveAs || !body.id) {
        // 新規保存の場合
        savedFlowItem = {
            id: uuidv4(),
            flowItem: body.flowItem,
            createdAt: Date.now(),
            updatedAt: Date.now()
        }
        if(!Array.isArray(db.data.savedFlowItems)){
            db.data.savedFlowItems = []
        }
        db.data.savedFlowItems.push(savedFlowItem)
    } else {
    // 更新の場合：既存の id をもとに上書き
    const index = db.data.savedFlowItems.findIndex(item => item.id === body.id)
    savedFlowItem = {
        id: body.id,
        flowItem: body.flowItem,
        createdAt: index !== -1 ? db.data.savedFlowItems[index].createdAt : Date.now(),
        updatedAt: Date.now()
    }
    if (index !== -1) {
        db.data.savedFlowItems[index] = savedFlowItem
    } else {
        // 見つからなければ新規として追加
        db.data.savedFlowItems.push(savedFlowItem)
    }
    }

    await db.write()
    return savedFlowItem
})
