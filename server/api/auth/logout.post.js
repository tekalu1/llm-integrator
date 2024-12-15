export default defineEventHandler(async (event) => {
    // auth_tokenクッキーを削除
    deleteCookie(event, 'auth_token')
    return { success: true }
  })
  