import { type FlowItem } from '@/types/flow';

export type ConditionItem = FlowItem & {
    condition: Condition[];
}

export type Condition = {
    leftSide: string;
    comparisonOperator: string;
    rightSide: string;
}
