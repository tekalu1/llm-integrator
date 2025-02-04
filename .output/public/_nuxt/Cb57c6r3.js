import{u as s}from"./D-sMymdb.js";import{d as i,a4 as a,v as n,x as p,z as m,L as l}from"./JqZd4KxG.js";import"./BcTueDZh.js";import"./IShi1APO.js";import"./DvF23Exx.js";const c=`
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
        
    `,b=i({__name:"gen-ai",async setup(d){let e,t;const o=s(),r=([e,t]=a(()=>o.generateFlowItem(c)),e=await e,t(),e);return(u,y)=>(n(),p("div",null,m(JSON.parse(l(r).choices[0].message.content)),1))}});export{b as default};
