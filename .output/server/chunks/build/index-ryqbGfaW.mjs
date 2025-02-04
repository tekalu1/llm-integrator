import { defineComponent, ref, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrInterpolate } from 'vue/server-renderer';
import { CharacterTextSplitter } from '@langchain/textsplitters';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    new CharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 0
    });
    const splitText = ref([]);
    ref(null);
    ref("");
    ref(null);
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(_attrs)}><h1>File to Markdown Converter</h1><form><input type="file" accept=".pdf,.txt,.docx"><button type="button">Convert</button></form><div><!--[-->`);
      ssrRenderList(splitText.value, (text, index) => {
        _push(`<div class="flex flex-col items-start justify-center p-1 m-1 border border-black">${ssrInterpolate(text)}</div>`);
      });
      _push(`<!--]--></div></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/file-to-markdown/v2/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-ryqbGfaW.mjs.map
