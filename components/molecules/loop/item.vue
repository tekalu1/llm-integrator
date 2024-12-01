<template>
  <div class="flex flex-col items-start justify-start my-2  rounded-lg ">
    <div class="flex items-center justify-center">
      <p class="mr-2">
        タイプ
      </p>
      <select
        v-model="loopItem.loopType"
        class="py-1 px-2 outline-none rounded-lg"
      >
        <option class="bg-white text-[#183153]">while</option>
      </select>

    </div>
    <div v-if="loopItem.loopType === 'while'"  class="mt-4">
      <p class="">
        条件
      </p>
      <MoleculesCondition :condition="loopItem.condition" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import type { LoopItem } from '~/types/item/loop';
  const uiStore = useUiStore();
  const loopStore = useLoopStore();
  const APIExecution = useAPIExecution();
  const props = defineProps({
      loopItem: {
          type: Object as PropType<LoopItem>,
          default: 0,
      },
  })
</script>