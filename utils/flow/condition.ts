import { type FlowItem, type SavedFlowItem } from '~/types/item/flow';
import { type ApiItem } from '~/types/item/api';
import { type ConditionItem, type Condition, type ConditionValueType, type ConditionValue } from '~/types/item/condition';

export function evaluateCondition(condition: Condition): boolean{
    const result: boolean = evaluateConditionReturnByConditionValue(condition).value === 'true'
    console.log("evaluateCondition : " + result)
    return result
}
export function evaluateConditionReturnByConditionValue(condition: Condition): ConditionValue {
    const toBoolean = (booleanStr: string): boolean => {
        // "true"文字列と比較した結果を返す
        // 念のため小文字化しておく
        return booleanStr.toLowerCase() === "true";
    };

    let left: ConditionValue = JSON.parse(JSON.stringify(condition.leftSide))
    let right: ConditionValue = JSON.parse(JSON.stringify(condition.rightSide))

    if(left.valueType === 'condition'){
        left = evaluateConditionReturnByConditionValue(left.value)
    }
    if(right.valueType === 'condition'){
        right = evaluateConditionReturnByConditionValue(right.value)
    }

    console.log("left: " + left.value + "  right: " + right.value)

    let evaluateResult: boolean = false

    switch (condition.comparisonOperator) {
        case '=':
            evaluateResult = left.value === right.value
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '!=':
            evaluateResult = left.value !== right.value;
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '<':
            if(left.valueType !== 'number' || right.valueType !== 'number'){
            throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
            }
            evaluateResult = Number(left.value) < Number(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '>':
            if(left.valueType !== 'number' || right.valueType !== 'number'){
            throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
            }
            evaluateResult = Number(left.value) > Number(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '<=':
            if(left.valueType !== 'number' || right.valueType !== 'number'){
            throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
            }
            evaluateResult = Number(left.value) <= Number(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '>=':
            if(left.valueType !== 'number' || right.valueType !== 'number'){
            throw new Error(`Invalid types for operator: ${typeof left.value} and ${typeof right.value}`);
            }
            evaluateResult = Number(left.value) >= Number(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case 'contain':
            if (typeof left.value === 'string' && typeof right.value === 'string') {
                evaluateResult = left.value.includes(right.value);
                return {
                value: evaluateResult.toString(),
                valueType: 'boolean'
                };
            }
            throw new Error(`Invalid types for 'contain' operator: ${typeof left.value} and ${typeof right.value}`);
        case '&':
            evaluateResult = toBoolean(left.value) && toBoolean(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        case '|':
            evaluateResult = toBoolean(left.value) || toBoolean(right.value);
            return {
            value: evaluateResult.toString(),
            valueType: 'boolean'
            };
        default:
            throw new Error(`Unsupported operator: ${condition.comparisonOperator}`);
    }
}