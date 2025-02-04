import { defineComponent, withAsyncContext, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrInterpolate } from 'vue/server-renderer';
import { u as useFlowStore } from './useFlowStore-Bci9blvY.mjs';
import 'pinia';
import './fetch-vM0MWLpl.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import './ssr-DLPS32Cj.mjs';
import './server.mjs';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'vue-router';
import 'vue-draggable-plus';
import '@vue-flow/core';
import '../_/v4.mjs';
import 'node:crypto';

const prompt = `
        # \u524D\u63D0
            API\u30D5\u30ED\u30FC\u4F5C\u6210\u30A2\u30D7\u30EA\u306B\u3064\u3044\u3066\u3001\u30D5\u30ED\u30FC\u30A2\u30A4\u30C6\u30E0\u306E\u30C7\u30FC\u30BF\u3092\u81EA\u52D5\u7684\u306B\u751F\u6210\u3059\u308B\u3053\u3068\u3092\u624B\u4F1D\u3063\u3066\u3044\u305F\u3060\u304D\u305F\u3044\u3067\u3059\u3002
            \u4E0B\u8A18\u306E\u578B\u69CB\u9020(ApiItem)\u306E\u30C7\u30FC\u30BF\u3092\u304A\u9001\u308A\u3057\u307E\u3059\u306E\u3067\u3001\u6307\u793A\u306B\u5408\u308F\u305B\u3066\u3001\u4FEE\u6B63\u3057\u305F\u30C7\u30FC\u30BF\u306E\u307F\u3092\u8FD4\u5374\u3057\u3066\u304F\u3060\u3055\u3044\u3002\uFF08json\u5F62\u5F0F\u3067\u3001\u305D\u308C\u4EE5\u5916\u306E\u6587\u5B57\u5217\u306F\u8FD4\u7B54\u3057\u306A\u3044\u3067\u304F\u3060\u3055\u3044\uFF09
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

            \u53C2\u8003
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

        # \u6307\u793A
            \u4E0B\u8A18\u306E\u30C7\u30FC\u30BF\u306B\u3064\u3044\u3066\u3001google\u306E\u30C8\u30C3\u30D7\u30DA\u30FC\u30B8\u306E\u5024\u3092\u30EA\u30AF\u30A8\u30B9\u30C8\u3059\u308BAPI\u306E\u30C7\u30FC\u30BF\u306B\u4FEE\u6B63\u3057\u3066\u307B\u3057\u3044\u3067\u3059\u3002
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
        
    `;
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "gen-ai",
  __ssrInlineRender: true,
  async setup(__props) {
    let __temp, __restore;
    const flowStore = useFlowStore();
    const getGenaratedDataByAi = ([__temp, __restore] = withAsyncContext(() => flowStore.generateFlowItem(prompt)), __temp = await __temp, __restore(), __temp);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}>${ssrInterpolate(JSON.parse(unref(getGenaratedDataByAi).choices[0].message.content))}</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/gen-ai.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=gen-ai-19Nr1G6f.mjs.map
