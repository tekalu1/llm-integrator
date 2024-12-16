import { type ExecutionResult, type FlowItem } from '~/types/item/flow';
import { type ApiItem, type RequestParameter } from '~/types/item/api';
import { type ConditionItem, type Condition } from '~/types/item/condition';
import { type ScriptItem } from '~/types/item/script';

export default defineEventHandler(async (event) => {
  const { flowItem, variables  } = await readBody(event);
  
  const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
  const startTime = Date.now();
  if(!flowItem.isItemActive){
    return
  }
  if(!this.isExecuting){
    return
  }
  uiStore.setIsExecutedFlow(flowItem.id, 'In progress')
  try {
    if(flowItem.type === 'condition' || flowItem.type === 'loop'){
      if(!flowStore.evaluateCondition(flowItem.condition)){
        uiStore.setIsExecutedFlow(flowItem.id, 'Done')
        return
      }
    }
    if(flowItem.type === 'api'){
      let stepConverted: ApiItem = JSON.parse(JSON.stringify(flowItem))
      stepConverted.headers = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.headers),flowItem)
      stepConverted.endpoint = flowStore.applyFlowVariablesOnString(flowItem.endpoint,flowItem)
      stepConverted.body = flowStore.applyFlowVariables(this.reverseTransformToRequestParameterArray(flowItem.body),flowItem)
      console.log(stepConverted)
      const result = await this.executeStep(stepConverted); // 個別ステップをサーバーに送信
      if (result && result.result) {
        const executionResult: ExecutionResult = {
          id: uuidv4(),
          success: result.result.success,
          data: result.result.data ? result.result.data : {},
          error: result.result.error ? result.result.error : null,
          executionDate: startTime,
          duration: Date.now() - startTime
        } 
        uiStore.setExecutionResults(flowItem.id,executionResult)
        this.executeScriptApiItem(flowItem)
      }
      console.log("result : ")
      console.log(result)
      console.log(result.result.success)
      if (!result.result.success) {
          // error.value = `ステップ ${step.id} でエラーが発生しました: ${result.error}`;
          throw new Error(`ステップ ${flowItem.id} でエラーが発生しました: ${result.error}`);
      }
    }
    
    if(flowItem.type === 'script'){
      this.executeScript(flowItem)
    }
    if(flowItem.flowItems.length > 0){
      for (const item of flowItem.flowItems) {
        await this.callApi(item); // 子ステップを実行
      }
    }
    if(flowItem.type === 'loop'){
      console.log("flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition) : ",flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition))
      if(flowItem.loopType === 'while' && flowStore.evaluateCondition(flowItem.condition)){
        await delay(200)
        await this.callApi(JSON.parse(JSON.stringify(flowItem)))
      }
    }
    if(flowItem.type === 'end'){
      this.isExecuting = false
    }
    
    if(flowItem.type === 'wait'){
      await delay(flowItem.waitTime)
    }
    uiStore.setIsExecutedFlow(flowItem.id, 'Done')
  } catch (e: any) {
      // error.value = `予期しないエラーが発生しました: ${e.message}`;
      console.log("error : " + e.message)
      uiStore.setIsExecutedFlow(flowItem.id, 'Done')
      throw e;
  }



  let res = {}
  let retRes = {}

  try {
    console.log(apiItem.id);

    if (!apiItem.endpoint || !/^https?:\/\//.test(apiItem.endpoint)) {
      throw new Error(`無効なエンドポイントです: ${apiItem.endpoint}`);
    }

    const requestOptions = {
      method: apiItem.method,
      headers: apiItem.headers,
      ...(apiItem.method !== 'GET' && {
        body: apiItem.body ? apiItem.body : undefined,
      }),
    };

    console.log(JSON.stringify(requestOptions));

    const response = await $fetch(apiItem.endpoint, {
      ...requestOptions,
      onResponse({ response }) {
        console.log(`Status Code: ${JSON.stringify(response.status)}`);
        res = response
      },
    });
    retRes.status = res.status
    retRes.data = res._data
    return { success: true, data: retRes };

  } catch (e: any) {
    const errorResponse = {
      success: false,
      message: e.message,
      status: e.status,
      response: e.response
    };

    return { success: false, error: errorResponse};
  }
});
