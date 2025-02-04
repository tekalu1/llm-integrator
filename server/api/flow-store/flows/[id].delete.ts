import { initDB  } from '~/server/utils/flow-store/lowdbClient'

export default defineEventHandler(async (event) => {
  const { id } = event.context.params
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id parameter' })
  }

  const db = await initDB()
  const index = db.data.savedFlowItems.findIndex(item => item.id === id)
  if (index === -1) {
    throw createError({ statusCode: 404, statusMessage: 'Flow not found' })
  }

  db.data.savedFlowItems.splice(index, 1)
  await db.write()
  return { success: true }
})
