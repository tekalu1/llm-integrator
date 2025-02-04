import { useSSRContext, defineComponent, mergeProps } from 'vue';
import { ssrRenderAttrs, ssrRenderSlot } from 'vue/server-renderer';

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "cool-scroll-bar-container",
  __ssrInlineRender: true,
  props: {
    bgColor: {
      type: String,
      default: "white"
    }
  },
  setup(__props) {
    return (_ctx, _push, _parent, _attrs) => {
      _push(`<div${ssrRenderAttrs(mergeProps({
        class: ["absolute max-h-full h-fit inset-0 flex flex-row scroll-smooth overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:bg-[#c397fb] [&::-webkit-scrollbar-thumb:hover]:bg-[#842ff7] [&::-webkit-scrollbar-track]:bg-opacity-0 [&::-webkit-scrollbar-thumb]:bg-opacity-50 [&::-webkit-scrollbar-thumb]:rounded-md [&::-webkit-scrollbar-thumb]:transition-all [&::-webkit-scrollbar-thumb]:duration-300 transition-all duration-300", __props.bgColor === "white" ? "bg-white bg-opacity-50 border-gray-300 border rounded-xl" : ""]
      }, _attrs))}>`);
      ssrRenderSlot(_ctx.$slots, "default", {}, null, _push, _parent);
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("components/atoms/common/cool-scroll-bar-container.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};

export { _sfc_main as _ };
//# sourceMappingURL=cool-scroll-bar-container-tamr20pv.mjs.map
