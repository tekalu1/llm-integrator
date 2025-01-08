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

    const adapter = new JSONFile(file);
    const db = new Low(adapter,adapter);
    
    // データベースを読み込み
    await db.read();
  
    console.log("db.data : " + JSON.stringify(db.data))
  
    if(!db.data[flowItemId]){
      return { error: 'Flow not found' }
    }
    
    return {success: true}
  }
  catch(e){
    console.error(e)
  }
});