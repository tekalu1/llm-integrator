import { type FlowItem } from '~/types/item/flow';

export type ApiItem = FlowItem & {
    endpoint: string;
    method: Method;
    headers: RequestParameter[];
    body: RequestParameter[];
    script: string;
    isScriptEnabled: boolean;
}

export type RequestParameter = {
    key?: string;
    type: 'string' | 'number' | 'boolean' | 'object' | 'array';
    value: any;
    children?: RequestParameter[];
}

export type Method = 'GET' | 'POST' | 'PUT' | 'DELETE'
  