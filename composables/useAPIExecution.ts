import { defineStore } from 'pinia';
import { v4 as uuidv4 } from 'uuid';
import { type FlowItem } from '@/types/flow';
import { type ApiItem } from '@/types/api';
import { type ConditionItem, type Condition } from '@/types/condition';

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
    executeScript(apiItem: ApiItem) {
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
      if(!flowItem.isItemActive){
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
            flowItem.executionResults.push(result.result)
            this.executeScript(flowItem)
          }
          console.log("result : ")
          console.log(result)
          if (!result.result.success) {
              // error.value = `ステップ ${step.id} でエラーが発生しました: ${result.error}`;
              throw new Error(`ステップ ${flowItem.id} でエラーが発生しました: ${result.error}`);
          }
        }
        if(flowItem.flowItems.length > 0){
          for (const item of flowItem.flowItems) {
            await this.callApi(item); // 次のステップを実行
          }
        }
      } catch (e: any) {
          // error.value = `予期しないエラーが発生しました: ${e.message}`;
          console.log(e.message)
      }
    }
  }
});
