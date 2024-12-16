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
export type SideMenuStatus = 'Flow List' | 'Variable List' | 'Both' ;
export type ViewMode = 'Flow' | 'Laboratory' ;