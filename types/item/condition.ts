import { type FlowItem } from '~/types/item/flow';

export type ConditionItem = FlowItem & {
    condition: Condition;
}

export type Condition = {
    id: string;
    leftSide: ConditionValue ;
    comparisonOperator: '&'|'|'|'='|'!='|'<'|'>'|'>='|'<='|'contain';
    rightSide: ConditionValue ;
}

export type ConditionValue = {
    value: string | Condition;
    valueType: ConditionValueType
}

export type ConditionValueType = 'condition'|'string'|'number'|'boolean'
