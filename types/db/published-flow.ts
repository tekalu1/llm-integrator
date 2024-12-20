import { type FlowItem, type Variables } from '~/types/item/flow';

export type PublishedFlowItems = {
    [userId: string]: PublishedFlowItem[]
}

export type PublishedFlowItem = {
    version: number;
    flowItem: FlowItem;
    variables: Variables;
}