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
        if(apiItem.isScriptEnabled){
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
    transformEntries(entries: any[], parentType: 'array'|'object'|null = null): any {
      // entriesはreverseTransformEntriesから出た形式を想定
      // parentTypeによって、現在構築中のオブジェクトが配列なのかオブジェクトなのかを決定する
      let acc: any;
  
      if (parentType === 'array') {
        // 親が配列なら、ここで生成するオブジェクトは基本的には配列要素をpushするための配列に
        acc = [];
      } else if (parentType === 'object') {
        // 親がオブジェクトならオブジェクト開始
        acc = {};
      } else {
        // トップレベルの場合、entriesを解析
        // 全要素がkeyを持たなければ配列、
        // 少なくとも1要素がkeyを持てばオブジェクトとみなす
        const hasKey = entries.some(e => e.hasOwnProperty('key'));
        acc = hasKey ? {} : [];
      }
  
      for (const entry of entries) {
        if (entry.type === 'array') {
          // childrenを再帰的に処理
          const transformedChildren = this.transformEntries(entry.children, 'array');
          if (entry.hasOwnProperty('key')) {
            acc[entry.key] = transformedChildren;
          } else {
            // keyがない => 親がarrayならpush、objectならどうする？
            // 親の構造に従って格納
            if (Array.isArray(acc)) {
              acc.push(transformedChildren);
            } else {
              // 親がオブジェクトの場合でkeyなしのarrayタイプは珍しいケース
              // 想定外であれば、特殊処理やエラーとする
              // ここではmergeせず、keyなし要素は配列として扱う方が自然かもしれない
              acc = [transformedChildren]; 
            }
          }
        } else if (entry.type === 'object') {
          const transformedChildren = this.transformEntries(entry.children, 'object');
          if (entry.hasOwnProperty('key')) {
            acc[entry.key] = transformedChildren;
          } else {
            // keyなしのオブジェクト
            if (Array.isArray(acc)) {
              // 親が配列ならpush
              acc.push(transformedChildren);
            } else {
              // 親がオブジェクトならマージ
              Object.assign(acc, transformedChildren);
            }
          }
        } else {
          // プリミティブ値
          if (entry.hasOwnProperty('key')) {
            acc[entry.key] = entry.value;
          } else {
            // keyなしプリミティブ
            if (Array.isArray(acc)) {
              acc.push(entry.value);
            } else {
              // 親がオブジェクトでkeyなしプリミティブは扱いが不明瞭なケース
              // ここでは無視するか、特殊キーで格納するなど
              acc = entry.value; 
            }
          }
        }
      }
  
      return acc;
    },
    reverseTransformEntries(obj: any): any[] {
      const entries: any[] = [];
  
      if (Array.isArray(obj)) {
        // 配列の場合
        for (const item of obj) {
          if (Array.isArray(item)) {
            entries.push({
              type: 'array',
              children: this.reverseTransformEntries(item)
            });
          } else if (typeof item === 'object' && item !== null) {
            entries.push({
              type: 'object',
              children: this.reverseTransformEntries(item)
            });
          } else {
            // プリミティブ
            entries.push({
              type: typeof item,
              value: item
            });
          }
        }
      } else if (typeof obj === 'object' && obj !== null) {
        // オブジェクトの場合: keyがある
        for (const key of Object.keys(obj)) {
          const value = obj[key];
          if (Array.isArray(value)) {
            entries.push({
              key: key,
              type: 'array',
              children: this.reverseTransformEntries(value)
            });
          } else if (typeof value === 'object' && value !== null) {
            entries.push({
              key: key,
              type: 'object',
              children: this.reverseTransformEntries(value)
            });
          } else {
            // プリミティブ値
            entries.push({
              key: key,
              type: typeof value,
              value: value
            });
          }
        }
      } else {
        // プリミティブ値のみの場合
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
