import { b as useNuxtApp } from './server.mjs';

function useRequestEvent(nuxtApp = useNuxtApp()) {
  return nuxtApp.ssrContext?.event;
}
function useRequestFetch() {
  return useRequestEvent()?.$fetch || globalThis.$fetch;
}

export { useRequestFetch as a, useRequestEvent as u };
//# sourceMappingURL=ssr-DLPS32Cj.mjs.map
