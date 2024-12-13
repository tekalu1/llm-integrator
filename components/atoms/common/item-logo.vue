<script setup lang="ts">
import { faL } from '@fortawesome/free-solid-svg-icons';

  const props = defineProps({
      itemType: {
          type: String,
          default: "flow",
      },
      size: {
          type: String,
          default: "flow",
      },
      rounded:{
        type: Boolean,
        default: false,
      }
  })

</script>

<template>
  <div class=" text-white font-bold flex justify-center items-center" :class="[size === 'small' ? 'text-xs ':'px-2', rounded ? 'rounded-md':'', itemType === 'flow' ? 'bg-blue-600':'', itemType === 'api' ? 'bg-red-600':'', itemType === 'condition' ? 'bg-orange-600':'', itemType === 'loop' ? 'bg-sky-600':'', itemType === 'script' ? 'bg-purple-600':'', itemType === 'end' ? 'bg-yellow-600':'', itemType === 'wait' ? 'bg-lime-600':'']" >
    <div class="w-6 flex justify-center items-center py-1 ">
      <font-awesome-icon v-if="itemType === 'flow'" :icon="['fas', 'wind']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'api'" :icon="['fas', 'circle-nodes']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'condition'" :icon="['fas', 'diagram-project']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'loop'" :icon="['fas', 'arrows-spin']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'end'" :icon="['fas', 'flag-checkered']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'script'" :icon="['fas', 'code']" :class="size === 'small' ? '':'mr-2'" />
      <font-awesome-icon v-if="itemType === 'wait'" :icon="['far', 'clock']" :class="size === 'small' ? '':'mr-2'" />
    </div>
    <p v-if="size !== 'small'">
      {{ itemType }}
    </p>
  </div>
</template>