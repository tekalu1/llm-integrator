import { defineComponent, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderStyle, ssrIncludeBooleanAttr, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "stream",
  __ssrInlineRender: true,
  setup(__props) {
    const messages = ref([]);
    const streaming = ref(false);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1>\u30B9\u30C8\u30EA\u30FC\u30E0\u7D50\u679C</h1><div style="${ssrRenderStyle({ "margin-bottom": "1em" })}"><button${ssrIncludeBooleanAttr(streaming.value) ? " disabled" : ""}>\u958B\u59CB</button><button${ssrIncludeBooleanAttr(!streaming.value) ? " disabled" : ""}>\u505C\u6B62</button></div><ul><!--[-->`);
      ssrRenderList(messages.value, (msg, index) => {
        _push(`<li>${ssrInterpolate(msg)}</li>`);
      });
      _push(`<!--]--></ul></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/stream.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=stream-hydT2xK2.mjs.map
