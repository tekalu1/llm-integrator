import { type FlowItem } from '~/types/item/flow';
import { type Condition } from '~/types/item/condition';

export type LoopItem = FlowItem & {
    loopType: 'foreach'|'while';
    condition: Condition;
    
}