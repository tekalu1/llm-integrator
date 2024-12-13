import { type FlowItem } from '~/types/item/flow';

export type WaitItem = FlowItem & {
    waitTime: Number;
}
