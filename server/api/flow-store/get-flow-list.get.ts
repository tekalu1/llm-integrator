import { initDB  } from '~/server/utils/flow-store/lowdbClient'

export default defineEventHandler(async (event) => {
  const db = await initDB()
  return db.data.savedFlowItems
})
