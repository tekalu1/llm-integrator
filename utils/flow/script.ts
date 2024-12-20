import type { ApiItem } from '~/types/item/api';
import type { ExecutionResult, Variables } from '~/types/item/flow';
import type { ScriptItem } from '~/types/item/script';

export function executeScriptApiItem(apiItem: ApiItem, variables:Variables, executionResult: ExecutionResult ) {
  try {
    const func = new Function('variables', 'result', apiItem.script);
    if(apiItem.isScriptEnabled){
      func(variables,executionResult); // オブジェクトをスクリプトで操作
    }
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}
export function executeScript(scriptItem: ScriptItem, variables: Variables) {
  try {
    const func = new Function('variables', scriptItem.script);
    func(variables); // オブジェクトをスクリプトで操作
  } catch (error) {
    console.error('スクリプト実行エラー:', error);
  }
}