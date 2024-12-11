import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type ExecutionResult, type FlowItem } from '~/types/item/flow';
import { type ApiItem, type RequestParameter } from '~/types/item/api';
import { type ConditionItem, type Condition } from '~/types/item/condition';
import { type ScriptItem } from '~/types/item/script';

export const useAPIExecution = defineStore('APIExecution', {
  state: () => ({
    isExecuting: false
  }),
  actions: {
    async executeStep (apiItem: ApiItem) {
      console.log("apiItem", apiItem)
      try {
        const { data } = await useFetch('/api/execute-flow', {
          method: 'POST',
          body: {
            apiItem
          }
        })
        
        return {
          result: data.value,
          error: "",
        }
      } catch (e: any) {
        return {
          result: {},
          error: e.message
        }
      }
    },
    executeScriptApiItem(apiItem: ApiItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      try {
        const func = new Function('variables', 'result', apiItem.script);
        if(apiItem.isScriptEnabled){
          func(flowStore.masterFlow.variables,uiStore.executionResults[apiItem.id].slice(-1)[0]); // オブジェクトをスクリプトで操作
        }
      } catch (error) {
        console.error('スクリプト実行エラー:', error);
      }
    },
    executeScript(scriptItem: ScriptItem) {
      const flowStore = useFlowStore();
      try {
        const func = new Function('variables', scriptItem.script);
        func(flowStore.masterFlow.variables); // オブジェクトをスクリプトで操作
      } catch (error) {
        console.error('スクリプト実行エラー:', error);
      }
    },
    transformEntriesArray(requestParameters: any, parentType = 'object'): RequestParameter[]{
      let result: RequestParameter[] = []
      for(const key of Object.keys(requestParameters)){
        if(this.getType(requestParameters[key]) === 'array'){
          result.push({
            key: key,
            type: 'array',
            value: null,
            children: this.transformEntriesArray(requestParameters[key], 'array')
          })
        }else if(this.getType(requestParameters[key]) === 'object'){
          if(parentType === 'array'){
            // console.log("result before : " + result)
            // console.log("requestParameters[key] : " + requestParameters[key])
            // console.log("key : " + key)
            if(requestParameters[key]){
              result.push({
                type: 'object',
                value: null,
                children: this.transformEntriesArray(requestParameters[key], 'array')
              })
            }else{
              result.push({
                key: key,
                type: 'object',
                value: null,
                children: []
              })
            }
            // console.log("result after : " + result)
          }else{
            if(requestParameters[key]){
              result.push({
                key: key,
                type: 'object',
                value: null,
                children: this.transformEntriesArray(requestParameters[key])
              })
            }else{
              result.push({
                key: key,
                type: 'object',
                value: null,
                children: []
              })
            }
            
          }
        }else{
          result.push({
            key: key,
            type: this.getType(requestParameters[key]),
            value: requestParameters[key]
          })
        }
      }
      return result
    },
    getType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
        if (Array.isArray(value)) return 'array';
        if (value === null) return 'object'; // nullはobject型として扱う
        return typeof value as 'string' | 'number' | 'boolean' | 'object';
    },
    reverseTransformToRequestParameterArray(params: RequestParameter[], parentType = 'object'): any {
      // console.log("called reverseTransformToRequestParameterArray")
      let result:any = {};
      if(parentType === 'array'){
        if(!Array.isArray(result)){
          result = []
        }
      }

      for (const param of params) {
        if(!param.key){
          if (param.children) {
            if(param.children.length > 0){
              result.push(this.reverseTransformToRequestParameterArray(param.children, param.type));
            }else{
              result = null
            }
          }else{
            if(parentType === 'array'){
              result.push(param.value)
            }else{
              result = param.value
            }
          }
        }else{
          if (param.children) {
            if(parentType === 'array'){
              result.push({[param.key]: this.reverseTransformToRequestParameterArray(param.children, param.type)});
            }else{
              if(param.children.length > 0){
                result[param.key] = this.reverseTransformToRequestParameterArray(param.children, param.type);
              }else{
                result[param.key] = null
              }
            }
          }else{
            if(parentType === 'array'){
              result.push({[param.key]: param.value})
            }else{
              result[param.key] = param.value
            }
          }
        }
      }
      return result
    },
    async runFlow (flowItem: FlowItem) {
      const uiStore = useUiStore();

      this.isExecuting = true;
      const startTime = Date.now();
  
      try {
        await this.callApi(flowItem)
        if (uiStore.executionResults[flowItem.id]) {
        } else {
        }
      } catch (e: any) {
        console.error(e)
      } finally {
        this.isExecuting = false; // 実行ステータスを解除
      }
    },
    async callApi (flowItem: FlowItem | ApiItem | ConditionItem) {
      const flowStore = useFlowStore();
      const uiStore = useUiStore();
      const startTime = Date.now();
      if(!flowItem.isItemActive){
        return
      }
      if(!this.isExecuting){
        return
      }
      try {
        if(flowItem.type === 'condition'){
          if(!flowStore.evaluateCondition(flowItem.condition)){
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
            await this.callApi(item); // 次のステップを実行
          }
        }
        if(flowItem.type === 'loop'){
          if(flowItem.loopType === 'while' && !flowStore.evaluateCondition(flowItem.condition)){
            this.callApi(flowItem)
          }
        }
        if(flowItem.type === 'end'){
          this.isExecuting = false
        }
      } catch (e: any) {
          // error.value = `予期しないエラーが発生しました: ${e.message}`;
          console.log("error : " + e.message)
          throw e;
      }
    },
    stopFlow () {
      this.isExecuting = false;
    }
  }
});
