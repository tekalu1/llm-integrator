export type RequestParameter = {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  children?: RequestParameter[];
}

export type IsExecutedFlow = {
  [flowId: string]: ExecuteStatus ;
}
export type ExecuteStatus = 'Not yet' | 'In progress' | 'Done' ;