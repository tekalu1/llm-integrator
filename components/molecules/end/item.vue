<template>
  <div class="flex flex-col items-start justify-start my-2  rounded-lg ">
  </div>
</template>

<script setup lang="ts">
  import type { EndItem } from '~/types/item/end';
  const props = defineProps({
      endItem: {
          type: Object as PropType<EndItem>,
          default: 0,
      },
  })
</script>