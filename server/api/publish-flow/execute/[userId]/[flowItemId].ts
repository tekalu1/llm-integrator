import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { existsSync, mkdirSync } from 'fs'
import { processStream } from '~/utils/execute/processStream';

export default defineEventHandler(async (event) => {
  try{
    const { req, res } = event.node;
    const { flowItemId, userId } = event.context.params
  
    const dir = './server/db/publish-flow/'
    const file = dir + userId + '.json'
    let retData = []
  
    if (!existsSync(dir)) {
      return { error: 'userId not found' }
    }
  
    console.log('aaa')
    const adapter = new JSONFile(file);
    const db = new Low(adapter,adapter);
    
    // データベースを読み込み
    await db.read();
  
    console.log("db.data : " + JSON.stringify(db.data))
  
    if(!db.data[flowItemId]){
      return { error: 'Flow not found' }
    }

    const controller = new AbortController();
  
    const response = await fetch('http://localhost:3000/api/execute/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        flowItem: db.data[flowItemId][db.data[flowItemId].length - 1].flowItem,
        variables: db.data[flowItemId][db.data[flowItemId].length - 1].variables
      }),
      signal: controller.signal
    })

    // if (!response.body) {
    //   throw new Error('No response body');
    // }

    console.log("response : "+JSON.stringify(response))

    // status.value = 'streaming';

    const reader = response.body?.getReader();

    // 汎用処理関数を使用
    await processStream(reader, (jsonData) => {
      console.log('Received:', jsonData);
      retData.push(jsonData)
    });
  
    return {success: true, response: retData}
  }
  catch(e){
    console.error(e)
  }
  
});