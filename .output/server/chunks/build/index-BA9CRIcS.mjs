import { defineComponent, ref, unref, useSSRContext } from 'vue';
import { ssrInterpolate } from 'vue/server-renderer';
import { u as useFlowStore } from './useFlowStore-Bci9blvY.mjs';
import { u as useAuthStore } from './useAuthStore-DfEvTafy.mjs';
import { x as getRequestURL } from '../nitro/nitro.mjs';
import { u as useRequestEvent } from './ssr-DLPS32Cj.mjs';
import 'pinia';
import './fetch-vM0MWLpl.mjs';
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
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import '../_/v4.mjs';
import 'node:crypto';

function useRequestURL(opts) {
  {
    return getRequestURL(useRequestEvent(), opts);
  }
}
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const flowStore = useFlowStore();
    const authStore = useAuthStore();
    const url = useRequestURL();
    ref("");
    ref();
    const responseExecute = ref();
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><button class="border border-gray-500 rounded-md px-2 py-1 mb-2"> \u767B\u9332 </button><div class="mb-8"><p> \u30A8\u30F3\u30C9\u30DD\u30A4\u30F3\u30C8 </p><p>${ssrInterpolate(unref(url).protocol + "//" + unref(url).host + "/api/publish-flow/execute/" + unref(authStore).user.id + "/" + unref(flowStore).masterFlow.id)}</p></div><button class="border border-gray-500 rounded-md px-2 py-1"> \u30C6\u30B9\u30C8\u5B9F\u884C </button><div class="h-96 overflow-auto border">${ssrInterpolate(JSON.stringify(unref(responseExecute)))}</div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/publish/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BA9CRIcS.mjs.map
