import { VueFlow } from '@vue-flow/core'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@vue-flow/core'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('VueFlow', VueFlow);
  nuxtApp.vueApp.component('EdgeLabelRenderer', EdgeLabelRenderer);
})