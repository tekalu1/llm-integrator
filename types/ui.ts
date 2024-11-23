export type RequestParameter = {
  key: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  value: any;
  children?: RequestParameter[];
}