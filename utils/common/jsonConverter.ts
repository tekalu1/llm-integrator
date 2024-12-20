import type { RequestParameter } from "~/types/item/api"

export function transformEntriesArray(requestParameters: any, parentType = 'object'): RequestParameter[]{
    let result: RequestParameter[] = []
    for(const key of Object.keys(requestParameters)){
      if(getType(requestParameters[key]) === 'array'){
        result.push({
          key: key,
          type: 'array',
          value: null,
          children: transformEntriesArray(requestParameters[key], 'array')
        })
      }else if(getType(requestParameters[key]) === 'object'){
        if(parentType === 'array'){
          // console.log("result before : " + result)
          // console.log("requestParameters[key] : " + requestParameters[key])
          // console.log("key : " + key)
          if(requestParameters[key]){
            result.push({
              type: 'object',
              value: null,
              children: transformEntriesArray(requestParameters[key], 'array')
            })
          }else{
            result.push({
              key: key,
              type: 'object',
              value: null,
              children: []
            })
          }
          // console.log("result after : " + result)
        }else{
          if(requestParameters[key]){
            result.push({
              key: key,
              type: 'object',
              value: null,
              children: transformEntriesArray(requestParameters[key])
            })
          }else{
            result.push({
              key: key,
              type: 'object',
              value: null,
              children: []
            })
          }
          
        }
      }else{
        result.push({
          key: key,
          type: getType(requestParameters[key]),
          value: requestParameters[key]
        })
      }
    }
    return result
  }
  export function getType(value: any): 'string' | 'number' | 'boolean' | 'object' | 'array' {
      if (Array.isArray(value)) return 'array';
      if (value === null) return 'object'; // nullはobject型として扱う
      return typeof value as 'string' | 'number' | 'boolean' | 'object';
  }
  export function reverseTransformToRequestParameterArray(params: RequestParameter[], parentType = 'object'): any {
    // console.log("called reverseTransformToRequestParameterArray")
    let result:any = {};
    if(parentType === 'array'){
      if(!Array.isArray(result)){
        result = []
      }
    }

    for (const param of params) {
      if(!param.key){
        if (param.children) {
          if(param.children.length > 0){
            result.push(reverseTransformToRequestParameterArray(param.children, param.type));
          }else{
            result = null
          }
        }else{
          if(parentType === 'array'){
            result.push(param.value)
          }else{
            result = param.value
          }
        }
      }else{
        if (param.children) {
          if(parentType === 'array'){
            result.push({[param.key]: reverseTransformToRequestParameterArray(param.children, param.type)});
          }else{
            if(param.children.length > 0){
              result[param.key] = reverseTransformToRequestParameterArray(param.children, param.type);
            }else{
              result[param.key] = null
            }
          }
        }else{
          if(parentType === 'array'){
            result.push({[param.key]: param.value})
          }else{
            result[param.key] = param.value
          }
        }
      }
    }
    return result
  }