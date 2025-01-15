<template>
    <div>
      {{ JSON.parse(getGenaratedDataByAi.choices[0].message.content) }}
    </div>
  </template>
  
  <script setup lang="ts">
    const flowStore = useFlowStore()
    const prompt = `
        # 前提
            APIフロー作成アプリについて、フローアイテムのデータを自動的に生成することを手伝っていただきたいです。
            下記の型構造(ApiItem)のデータをお送りしますので、指示に合わせて、修正したデータのみを返却してください。（json形式で、それ以外の文字列は返答しないでください）
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

            参考
            export type FlowItem = {
            id: string;
            name: string;
            type: 'flow'|'api'|'condition'|'loop'|'script'|'end'|'wait';
            description: string;
            isItemActive: boolean;
            variables: {};
            executionResults: ExecutionResult[];
            flowItems: FlowItem[];
            }

        # 指示
            下記のデータについて、googleのトップページの値をリクエストするAPIのデータに修正してほしいです。
            {
                id: "",
                name: "",
                type: "api",
                description: "",
                isItemActive: true,
                variables: {},
                executionResults: [],
                flowItems: [],
                endpoint: "",
                method: "GET",
                headers: [],
                body: [],
                script: "",
                isScriptEnabled: false
            }
        
    `
    const getGenaratedDataByAi = await flowStore.generateFlowItem(prompt)
  </script>
  