import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type ExecutionResult, type FlowItem } from '~/types/item/flow';
import { type ApiItem } from '~/types/item/api';
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
      try {
        const func = new Function('variables', 'result', apiItem.script);
        if(apiItem.isScriptEnabled && apiItem.executionResults.length > 0){
          func(flowStore.masterFlow.variables,apiItem.executionResults.slice(-1)[0]); // オブジェクトをスクリプトで操作
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
    transformEntries(entries: any[]): any {
      return entries.reduce((acc, entry) => {
        if (entry.children) {
          const transformedChildren = Array.isArray(entry.children) ? this.transformEntries(entry.children) : {};
          if (entry.key) {
            // keyが存在する場合、オブジェクトに追加
            acc[entry.key] = transformedChildren;
          } else {
            // keyがない場合、直接配列として追加
            if (Array.isArray(acc)) {
              acc.push(transformedChildren);
            } else {
              Object.assign(acc, transformedChildren);
            }
          }
        } else if (entry.key) {
          // keyが存在する場合、key: valueの形式で追加
          acc[entry.key] = entry.value;
        }
        return acc;
      }, Array.isArray(entries) && entries.length && !entries[0].key ? [] : {});
    },
    reverseTransformEntries(obj: any): any[] {
      const entries: any[] = [];
    
      if (Array.isArray(obj)) {
        // 配列の場合、各要素を処理
        obj.forEach(item => {
          entries.push({
            type: 'array',
            children: this.reverseTransformEntries(item)
          });
        });
      } else if (typeof obj === 'object' && obj !== null) {
        // オブジェクトの場合、キーと値を処理
        Object.keys(obj).forEach(key => {
          const value = obj[key];
          if (typeof value === 'object' && value !== null) {
            entries.push({
              key: key,
              type: Array.isArray(value) ? 'array' : 'object',
              children: this.reverseTransformEntries(value)
            });
          } else {
            entries.push({
              key: key,
              type: typeof value,
              value: value
            });
          }
        });
      } else {
        // プリミティブ値の場合
        entries.push({
          type: typeof obj,
          value: obj
        });
      }
    
      return entries;
    },
    async runFlow (flowItem: FlowItem) {

      this.isExecuting = true;
      const startTime = Date.now();
  
      try {
        await this.callApi(flowItem)
        if (flowItem.executionResults) {
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
          stepConverted.headers = flowStore.applyFlowVariables(this.transformEntries(flowItem.headers),flowItem)
          stepConverted.endpoint = flowStore.applyFlowVariablesOnString(flowItem.endpoint,flowItem)
          stepConverted.body = flowStore.applyFlowVariables(this.transformEntries(flowItem.body),flowItem)
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
            flowItem.executionResults.push(executionResult)
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
