export type FlowItem = {
  id: string;
  name: string;
  type: 'flow'|'api'|'condition'|'loop'|'script'|'end';
  description: string;
  isItemActive: boolean;
  variables: {};
  executionResults: ExecutionResult[];
  flowItems: FlowItem[];
}


export type ExecutionResult = {
  id: string;
  success: boolean;
  data: {};
  error?: {};
  executionDate: number;
  duration: number;
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