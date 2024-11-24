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
  <div class=" text-white font-bold flex py-1 justify-center items-center" :class="[size === 'small' ? 'text-xs px-1':'px-2', rounded ? 'rounded-md':'', itemType === 'flow' ? 'bg-blue-600':'bg-red-600']" >
    <font-awesome-icon v-if="itemType === 'flow'" :icon="['fas', 'wind']" :class="size === 'small' ? '':'mr-2'" />
    <font-awesome-icon v-if="itemType === 'api'" :icon="['fas', 'circle-nodes']" :class="size === 'small' ? '':'mr-2'" />
    <p v-if="size !== 'small'">
      {{ itemType }}
    </p>
  </div>
</template>