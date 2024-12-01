import { type FlowItem } from '~/types/item/flow';

export type ScriptItem = FlowItem & {
    script: string;
}
