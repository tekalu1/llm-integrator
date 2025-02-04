import { _ as _sfc_main$1 } from './cool-scroll-bar-container-tamr20pv.mjs';
import { defineComponent, ref, withAsyncContext, withCtx, unref, createVNode, openBlock, createBlock, Fragment, renderList, toDisplayString, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderComponent, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderAttr } from 'vue/server-renderer';
import { CharacterTextSplitter } from '@langchain/textsplitters';
import { u as useAuthStore } from './useAuthStore-DfEvTafy.mjs';
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
  async setup(__props) {
    let __temp, __restore;
    const authStore = useAuthStore();
    const selectedDocumentId = ref("");
    const selectedVersion = ref("");
    useFlowStore();
    const onDocumentSelected = (documentId, version) => {
      selectedDocumentId.value = documentId;
      selectedVersion.value = version;
    };
    const documentList = ref();
    const getDocumentList = async () => {
      await authStore.fetchUser();
      if (!authStore.user) {
        throw new Error("no userId");
      }
      const response = await $fetch("/api/rag/get-document-list", {
        method: "POST",
        body: {
          userId: authStore.user.id
        }
      });
      if (response.error) {
        throw new Error(response.error.message);
      } else {
        documentList.value = JSON.parse(JSON.stringify(response));
      }
    };
    const documentListWithMetaData = ref([]);
    const getDocumentMetaData = async () => {
      try {
        await getDocumentList();
        documentListWithMetaData.value = [];
        for (const document of documentList.value) {
          console.log("document : " + JSON.stringify(document));
          const response = await $fetch("/api/rag/get-document-meta-data", {
            method: "POST",
            body: {
              userId: authStore.user.id,
              documentId: document.documentId,
              version: document.version
            }
          });
          if (document.error) {
            throw new Error(document.error.message);
          } else {
            documentListWithMetaData.value.push(
              {
                documentId: document.documentId,
                version: document.version,
                name: response.documentName,
                metaData: response.metaData
              }
            );
          }
        }
      } catch (e) {
        console.error(e.message);
      }
    };
    [__temp, __restore] = withAsyncContext(() => getDocumentMetaData()), await __temp, __restore();
    new CharacterTextSplitter({
      chunkSize: 100,
      chunkOverlap: 0
    });
    const splitText = ref([]);
    ref(null);
    ref("");
    ref(null);
    ref("");
    const upsertCount = ref(null);
    const userQuery = ref("");
    const answer = ref("");
    const context = ref([]);
    return (_ctx, _push, _parent, _attrs) => {
      const _component_AtomsCommonCoolScrollBarContainer = _sfc_main$1;
      _push(`<!--[--><div class="m-2 p-1"><h1 class="text-sm"> \u767B\u9332\u6E08\u307F\u306E\u30CE\u30A6\u30CF\u30A6 </h1><div class="relative h-[40vh]">`);
      _push(ssrRenderComponent(_component_AtomsCommonCoolScrollBarContainer, { class: "h-full flex flex-col" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="flex flex-wrap"${_scopeId}><!--[-->`);
            ssrRenderList(unref(documentListWithMetaData), (document, index) => {
              _push2(`<div class="${ssrRenderClass([unref(selectedDocumentId) === document.documentId ? "outline outline-blue-500" : "outline-none", "lg:w-1/6 w-1/3 h-64 bg-white border-gray-300 m-2 p-2 rounded-md flex flex-col items-start justify-center transition-all duration-150"])}"${_scopeId}><div class="flex items-center justify-center"${_scopeId}><h1 class="flex-grow"${_scopeId}>${ssrInterpolate(document.name)}</h1></div><div class="flex-grow overflow-hidden text-ellipsis"${_scopeId}><!--[-->`);
              ssrRenderList(document.metaData, (metaDataElement, index2) => {
                _push2(`<div class="mb-2 p-1 rounded-md bg-gray-200"${_scopeId}><span class="bg-purple-500 text-white px-1 rounded-md"${_scopeId}>${ssrInterpolate(`#chank-${index2 + 1}`)}</span> ${ssrInterpolate(metaDataElement)}</div>`);
              });
              _push2(`<!--]--></div></div>`);
            });
            _push2(`<!--]--></div>`);
          } else {
            return [
              createVNode("div", { class: "flex flex-wrap" }, [
                (openBlock(true), createBlock(Fragment, null, renderList(unref(documentListWithMetaData), (document, index) => {
                  return openBlock(), createBlock("div", {
                    key: document.documentId,
                    class: ["lg:w-1/6 w-1/3 h-64 bg-white border-gray-300 m-2 p-2 rounded-md flex flex-col items-start justify-center transition-all duration-150", unref(selectedDocumentId) === document.documentId ? "outline outline-blue-500" : "outline-none"],
                    onClick: ($event) => onDocumentSelected(document.documentId, document.version)
                  }, [
                    createVNode("div", { class: "flex items-center justify-center" }, [
                      createVNode("h1", { class: "flex-grow" }, toDisplayString(document.name), 1)
                    ]),
                    createVNode("div", { class: "flex-grow overflow-hidden text-ellipsis" }, [
                      (openBlock(true), createBlock(Fragment, null, renderList(document.metaData, (metaDataElement, index2) => {
                        return openBlock(), createBlock("div", {
                          key: index2,
                          class: "mb-2 p-1 rounded-md bg-gray-200"
                        }, [
                          createVNode("span", { class: "bg-purple-500 text-white px-1 rounded-md" }, toDisplayString(`#chank-${index2 + 1}`), 1),
                          createTextVNode(" " + toDisplayString(metaDataElement), 1)
                        ]);
                      }), 128))
                    ])
                  ], 10, ["onClick"]);
                }), 128))
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div></div><div class="m-2 p-1"><h1 class="text-sm">\u767B\u9332</h1><form class="flex flex-col"><input type="file" accept=".pdf,.txt,.docx" class="mb-2"><div class="mb-2"><button class="bg-blue-500 rounded-md px-2 py-1 relative z-0 overflow-hidden text-white"> \u30C1\u30E3\u30F3\u30AF\u306B\u5909\u63DB </button></div></form><div class="relative h-[20vh] mb-2">`);
      _push(ssrRenderComponent(_component_AtomsCommonCoolScrollBarContainer, { class: "h-full flex flex-col p-2" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<!--[-->`);
            ssrRenderList(unref(splitText), (text2, index) => {
              _push2(`<div class="mb-2 p-1 rounded-md bg-gray-200"${_scopeId}><span class="bg-purple-500 text-white px-1 rounded-md"${_scopeId}>${ssrInterpolate(`#chank-${index + 1}`)}</span> ${ssrInterpolate(text2)}</div>`);
            });
            _push2(`<!--]-->`);
          } else {
            return [
              (openBlock(true), createBlock(Fragment, null, renderList(unref(splitText), (text2, index) => {
                return openBlock(), createBlock("div", {
                  key: index,
                  class: "mb-2 p-1 rounded-md bg-gray-200"
                }, [
                  createVNode("span", { class: "bg-purple-500 text-white px-1 rounded-md" }, toDisplayString(`#chank-${index + 1}`), 1),
                  createTextVNode(" " + toDisplayString(text2), 1)
                ]);
              }), 128))
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div><div><button class="bg-blue-500 transit duration-200 rounded-md px-2 py-1 relative z-0 overflow-hidden text-white"> \u767B\u9332 </button>`);
      if (unref(upsertCount) !== null) {
        _push(`<p> \u7D50\u679C\uFF1AUpserted ${ssrInterpolate(unref(upsertCount))} chunks! </p>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div></div><div class="border border-black m-2 p-1"><h1>RAG Demo</h1><input${ssrRenderAttr("value", unref(userQuery))} placeholder="\u8CEA\u554F\u3092\u5165\u529B"><button>Ask</button>`);
      if (unref(answer)) {
        _push(`<div><h2>\u56DE\u7B54</h2><p>${ssrInterpolate(unref(answer))}</p><h3>\u53C2\u7167\u30B3\u30F3\u30C6\u30AD\u30B9\u30C8</h3><ul><!--[-->`);
        ssrRenderList(unref(context), (ctx, idx) => {
          _push(`<li>${ssrInterpolate(ctx)}</li>`);
        });
        _push(`<!--]--></ul></div>`);
      } else {
        _push(`<!---->`);
      }
      _push(`</div><!--]-->`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/test/file-to-markdown/v3/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as default };
//# sourceMappingURL=index-BFzH_hfo.mjs.map
