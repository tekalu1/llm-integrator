import { initDB  } from '~/server/utils/flow-store/lowdbClient'

export default defineEventHandler(async (event) => {
  // URL のパラメータから id を取得
  const { id } = event.context.params
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })
  }

  // lowdb の初期化とデータ読み込み
  const db = await initDB()

  // 指定された id のフローを検索
  const savedFlowItem = db.data.savedFlowItems.find(item => item.id === id)
  if (!savedFlowItem) {
    throw createError({ statusCode: 404, statusMessage: 'Flow not found' })
  }

  return savedFlowItem
})
