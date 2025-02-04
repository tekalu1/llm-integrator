import { _ as __nuxt_component_0 } from './app-logo-jvqRr6N2.mjs';
import { ref, mergeProps, unref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderAttr, ssrRenderStyle, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useAuthStore } from './useAuthStore-DfEvTafy.mjs';
import './server.mjs';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:fs';
import 'node:path';
import 'node:url';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'devalue';
import '@unhead/ssr';
import 'unhead';
import '@unhead/shared';
import 'pinia';
import 'vue-router';
import 'vue-draggable-plus';
import '@vue-flow/core';
import './fetch-vM0MWLpl.mjs';
import './ssr-DLPS32Cj.mjs';

const _sfc_main = {
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    useAuthStore();
    const username = ref("");
    const password = ref("");
    const email = ref("");
    const error = ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonAppLogo = __nuxt_component_0;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "w-full h-full flex items-center justify-center" }, _attrs))}><div class="h-[40%] flex items-center justify-center bg-white rounded-xl shadow-[0px_0px_24px_0px_rgb(0,0,0,0.2)] overflow-hidden"><div class="flex flex-col items-center justify-center flex-grow px-8"><div class="flex flex-col items-start justify-center flex-grow"><h1 class="border-l-2 border-[#842ff7] px-2 text-2xl mb-4"> Sign Up </h1><form class="text-base"><div class="mb-2"><input${ssrRenderAttr("value", unref(username))} placeholder="Username" required class="outline-none"></div><div><input type="password"${ssrRenderAttr("value", unref(password))} placeholder="Password" required class="outline-none"></div><div class="mb-2"><input type="email"${ssrRenderAttr("value", unref(email))} placeholder="Email Address" required class="outline-none"></div><button type="submit" class="bg-[#6e7af8] border border-gray-200 rounded-lg text-white text-lg px-3 py-1 w-full mt-4">\u767B\u9332</button></form>`);
      if (unref(error)) {
        _push(`<p style="${ssrRenderStyle({ "color": "red" })}">${ssrInterpolate(unref(error))}</p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><a href="/login" class="mt-4"><p class="text-gray-500 underline"> Login\u306F\u3053\u3061\u3089 </p></a></div><div class="flex items-center justify-center h-full px-8 text-white font-bold border border-gray-300 bg-gradient-to-r from-[#6e7af8] from-5% via-[#6c56e4] via-30% to-[#842ff7] to-80% transition duration-300 text-2xl">`);
      _push(ssrRenderComponent(_component_AtomsCommonAppLogo, null, null, _parent));
      _push(`</div></div></div>`);
    };
  }
};
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/signup/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-DYLYSF-m.mjs.map
