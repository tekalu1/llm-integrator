import { defineComponent, ref, unref, useSSRContext } from 'vue';
import { ssrInterpolate, ssrRenderList } from 'vue/server-renderer';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useFlowStore();
    const messages = ref([]);
    const status = ref("connecting");
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<!--[--><button class="border rounded-md px-2 py-1"> start </button><div><h1>POST + ReadableStream Example</h1><p>Status: ${ssrInterpolate(unref(status))}</p><ul><!--[-->`);
      ssrRenderList(unref(messages), (m, index) => {
        _push(`<li>${ssrInterpolate(m)}</li>`);
      });
      _push(`<!--]--></ul></div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/execute/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BG4cOfyE.mjs.map
