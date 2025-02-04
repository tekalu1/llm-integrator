import { useSSRContext, defineComponent, resolveComponent, mergeProps, unref } from 'vue';
import { ssrRenderAttrs, ssrRenderList, ssrRenderClass, ssrInterpolate, ssrRenderComponent } from 'vue/server-renderer';
import { u as useMessageQueue } from './useMessageQueue-EDFjpfdQ.mjs';
import { _ as _export_sfc } from './server.mjs';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "notification-queue",
  __ssrInlineRender: true,
  setup(__props) {
    const messageQueue = useMessageQueue();
    function getClass(type) {
      switch (type) {
        case "error":
          return "bg-red-500 text-white";
        case "success":
          return "bg-green-500 text-white";
        case "info":
          return "bg-blue-500 text-white";
        case "warning":
          return "bg-yellow-500 text-black";
      }
    }
    return (_ctx, _push, _parent, _attrs) => {
      const _component_font_awesome_icon = resolveComponent("font-awesome-icon");
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "space-y-2 mb-2" }, _attrs))} data-v-a3ea5480><!--[-->`);
      ssrRenderList(unref(messageQueue).messageQueue, (message) => {
        _push(`<div class="${ssrRenderClass([getClass(message.type), "p-4 rounded-lg shadow transition-all duration-300 fade-in-out flex items-center justify-center"])}" data-v-a3ea5480><p data-v-a3ea5480>${ssrInterpolate(message.content)}</p><button class="underline h-full flex items-center justify-start ml-2" data-v-a3ea5480>`);
        _push(ssrRenderComponent(_component_font_awesome_icon, {
          class: "hover:opacity-50 transition-all duration-300 cursor-pointer",
          icon: ["fas", "xmark"]
        }, null, _parent));
        _push(`</button></div>`);
      });
      _push(`<!--]--></div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/notification-queue.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const __nuxt_component_2 = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-a3ea5480"]]);

export { __nuxt_component_2 as _ };
//# sourceMappingURL=notification-queue-2XnyL0tW.mjs.map
