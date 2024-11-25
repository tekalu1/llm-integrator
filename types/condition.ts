import { type FlowItem } from '@/types/flow';

export type ConditionItem = FlowItem & {
    condition: Condition;
}

export type Condition = {
    id: string;
    leftSide: string | Condition | number | boolean ;
    comparisonOperator: '&'|'|'|'='|'!='|'<'|'>'|'>='|'<='|'contain';
    rightSide: string | Condition | number | boolean ;
}
