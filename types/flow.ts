export type FlowItem = {
  id: string;
  name: string;
  type: 'flow'|'api';
  description: string;
  isItemActive: boolean;
  variables: {};
  executionResults: ExecutionResult[];
  flowItems: FlowItem[];
}


export type ExecutionResult = {
  success: boolean;
  data: {};
  error: {};
}

export type ExecutionHistory = {
  id: string;
  flowItem: FlowItem;
  executionDate: Date;
  duration: number;
}

export type SavedFlowItem = {
  id: string;
  flowItem: FlowItem;
  createdAt: number;
  updatedAt: number;
}


export type DisplayStatus = 'flow' | 'history' | 'result'