import type { Variables } from '~/types/item/flow';

export function applyFlowVariables(obj: any, variables: Variables) {
    // 変数のキーを ${variableName} の形式で取得し展開
    let result = JSON.parse(JSON.stringify(obj))
    let resultStr = JSON.stringify(result)

    resultStr = applyFlowVariablesOnString(resultStr, variables)
    console.log(resultStr)

    return JSON.parse(resultStr)
  }
export function applyFlowVariablesOnString(text: string, variabless: Variables): string {
    // 変数のキーを ${variableName} の形式で取得し展開
    let result = text
    try{
        for(let key in variabless){
        result = result.replace("{{" + key + "}}", variabless[key])
        }

        return result.replace(/\n/g, "\\n")
    }catch{
        return result
    }
}