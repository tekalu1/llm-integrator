import { type Variables, type ExecutionResult, type FlowItem } from '~/types/item/flow';
import { type ApiItem } from '~/types/item/api';
import { applyFlowVariables, applyFlowVariablesOnString } from '~/utils/flow/variable'
import { evaluateCondition } from '~/utils/flow/condition'
import { reverseTransformToRequestParameterArray } from '~/utils/common/jsonConverter';
import { v4 as uuidv4 } from 'uuid';
// import { executeStep } from '~/utils/flow/execute';
import { executeScript, executeScriptApiItem } from '~/utils/flow/script';

export async function executeStep(apiItem: ApiItem) {
  console.log("apiItem", apiItem)
  try {
    const data = await $fetch('/api/execute-flow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: {
        apiItem
      }
    })
    
    return {
      result: data,
      error: "",
    }
  } catch (e: any) {
    return {
      result: {},
      error: e.message
    }
  }
}

async function callApi(
  flowItem: FlowItem, 
  variables: Variables,
  sendData: (data: any) => Promise<void>,
  isClientDisconnected: () => boolean
): Promise<void> {
  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // クライアントが切断していれば処理中断
  if (isClientDisconnected()) {
    await sendData({ id: flowItem.id, status: 'Done' });
    return;
  }

  const startTime = Date.now();

  if(!flowItem.isItemActive){
    return;
  }

  // 処理開始メッセージ送信
  await sendData({ id: flowItem.id, status: 'In progress' });

  try {
    if(!flowItem.isItemActive){
      return;
    }

    if(flowItem.type === 'condition' || flowItem.type === 'loop'){
      if(!evaluateCondition(applyFlowVariables(flowItem.condition, variables))){
        await sendData({ id: flowItem.id, status: 'Done' });
        return;
      }
    }

    if(flowItem.type === 'api'){
      let stepConverted: ApiItem = JSON.parse(JSON.stringify(flowItem));
      stepConverted.headers = applyFlowVariables(reverseTransformToRequestParameterArray(flowItem.headers), variables);
      stepConverted.endpoint = applyFlowVariablesOnString(flowItem.endpoint, variables);
      stepConverted.body = applyFlowVariables(reverseTransformToRequestParameterArray(flowItem.body), variables);

      console.log(stepConverted);
      const result = await executeStep(stepConverted); // 個別ステップをサーバーに送信
      console.log(JSON.stringify(result));
      if (result && result.result) {
        const executionResult: ExecutionResult = {
          id: uuidv4(),
          success: result.result.success,
          data: result.result.data ? result.result.data : {},
          error: result.result.error ? result.result.error : null,
          executionDate: startTime,
          duration: Date.now() - startTime
        };
        executeScriptApiItem(flowItem, variables, executionResult);
        await sendData({ id: flowItem.id, executionResult: executionResult, variables: variables });
      }

      console.log("result : ", result);
      console.log(result.result.success);
      if (!result.result.success) {
          throw new Error(`ステップ ${flowItem.id} でエラーが発生しました: ${result.error}`);
      }
    }

    if(flowItem.type === 'script'){
      executeScript(flowItem, variables);
      await sendData({ id: flowItem.id, variables: variables });
    }

    if(flowItem.flowItems && flowItem.flowItems.length > 0){
      for (const item of flowItem.flowItems) {
        if(isClientDisconnected()) break; // クライアント切断チェック
        await callApi(JSON.parse(JSON.stringify(item)), variables, sendData, isClientDisconnected); // 子ステップを再帰的に実行
      }
    }

    if(flowItem.type === 'loop'){
      console.log("flowItem.loopType === 'while' && evaluateCondition(...): ",
        flowItem.loopType === 'while' && evaluateCondition(applyFlowVariables(flowItem.condition, variables)));
      if(flowItem.loopType === 'while' && evaluateCondition(applyFlowVariables(flowItem.condition, variables))){
        await delay(200);
        await callApi(JSON.parse(JSON.stringify(flowItem)), variables, sendData, isClientDisconnected);
      }
    }

    if(flowItem.type === 'end'){
      await sendData({ id: flowItem.id, status: 'Done' });
      return;
    }

    if(flowItem.type === 'wait'){
      await delay(flowItem.waitTime);
    }

    await sendData({ id: flowItem.id, status: 'Done' });
  } catch (e: any) {
      console.log("error : " + e.message);
      await sendData({ id: flowItem.id, status: 'Done' });
      throw e;
  }
}


export default defineEventHandler(async (event) => {
  
  const { req, res } = event.node;

  // JSONライン区切りフォーマットでストリーム送信
  res.statusCode = 200;
  // NDJSON(改行区切りJSON)で送信
  res.setHeader('Content-Type', 'application/x-ndjson');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Transfer-Encoding', 'chunked');

  let clientDisconnected = false;

  const { flowItem, variables } = await readBody(event);

  console.log("flowItem : " + JSON.stringify(flowItem))
  // クライアントが接続を閉じた場合
  req.on('close', () => {
    clientDisconnected = true;
  });

  const isClientDisconnected = () => clientDisconnected;

  // データ送信（行単位でJSONエンコード）
  const sendData = async (data: any) => {
    if (isClientDisconnected()) return;
    const payload = JSON.stringify(data) + "\n";
    res.write(payload);
  };

  // 接続確立メッセージ送信
  await sendData({ connectionStatus: 'established' });

  try {
    // 再帰的処理実行
    await callApi(flowItem, variables, sendData, isClientDisconnected);

    if (!isClientDisconnected()) {
      // 完了メッセージ送信
      await sendData({ connectionStatus: 'completed' });
      res.end();
    }
  } catch (error: any) {
    if (!isClientDisconnected()) {
      // エラーメッセージ送信
      await sendData({ error: error.message });
      res.end();
    }
  }
});
