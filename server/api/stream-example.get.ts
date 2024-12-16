export default defineEventHandler(async (event) => {
    const { req, res } = event.node
    // const { flowItem, variables  } = await readBody(event);
    
  
    // ステータスコードとヘッダーを明示的に設定
    res.statusCode = 200
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')
    
    // 初回メッセージ送信（任意）
    res.write(`data: ${JSON.stringify({ message: 'Connection established' })}\n\n`)
  
    const intervalId = setInterval(() => {
      // 定期的にイベントを送信
      const payload = { time: new Date() }
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
    }, 1000)
  
    // クライアントが接続を閉じた場合のクリーンアップ
    req.on('close', () => {
      clearInterval(intervalId)
    })
  
    // ハンドラ内で特にreturnはしない。Promiseを返してリクエストが
    // 明示的に完了するまで待たせることも可能です。
    return new Promise(() => {
      // 処理は接続終了時(req.on('close')で)に実質的に完了
    })
  }
)