<script setup>
import { Position, Handle } from '@vue-flow/core'

// props were passed from the slot using `v-bind="customNodeProps"`
const props = defineProps(['label'])
</script>

<template>
  <div class="bg-white">
    <Handle type="target" :position="Position.Top" />
    <div>{{ label }}</div>
    <Handle type="source" :position="Position.Bottom" />
  </div>
</template>